import { OAuth2Client } from "google-auth-library";
import { ApiError } from "@/shared/ApiError";
import { env, isDevelopment } from "@/config/env";
import {
  comparePassword,
  generateOpaqueToken,
  generateOtp,
  hashPassword,
  hashToken,
} from "@/utils/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/utils/jwt";
import { sendMail } from "@/shared/mail/mailer";
import {
  passwordChangedEmailTemplate,
  passwordResetEmailTemplate,
  verificationEmailTemplate,
  welcomeEmailTemplate,
} from "@/shared/mail/templates";
import { authRepository } from "@/modules/auth/auth.repository";
import type {
  ForgotPasswordInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResendCodeInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@/modules/auth/auth.validation";
import { User } from "@prisma/client";

const OTP_TTL_MINUTES = 15;
const RESET_TTL_MINUTES = 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;
// Development-only convenience code so local testing doesn't require reading the Ethereal inbox.
// Never active outside NODE_ENV=development (see isDevelopment guard at the call site).
const DEV_BYPASS_OTP = "000000";

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function toPublicUser(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    points: user.points,
    reputation: user.reputation,
    emailVerified: user.emailVerified,
    onboardingCompleted: user.onboardingCompleted,
    language: user.language,
    institutionId: user.institutionId,
    createdAt: user.createdAt,
  };
}

async function issueTokens(user: User, rememberMe: boolean, meta: RequestMeta): Promise<AuthTokens> {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  });

  const jti = generateOpaqueToken();
  const refreshToken = signRefreshToken({ sub: user.id, jti }, rememberMe);
  const decodedExpiryMs = rememberMe ? 90 : 30;

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    ip: meta.ip,
    userAgent: meta.userAgent,
    expiresAt: new Date(Date.now() + decodedExpiryMs * 24 * 60 * 60 * 1000),
  });

  await authRepository.createSession({
    user: { connect: { id: user.id } },
    ip: meta.ip,
    userAgent: meta.userAgent,
    expiresAt: new Date(Date.now() + decodedExpiryMs * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
}

async function sendVerificationCode(user: User) {
  await authRepository.invalidateEmailVerificationTokens(user.id);
  const code = generateOtp();
  await authRepository.createEmailVerificationToken({
    userId: user.id,
    codeHash: hashToken(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });
  await sendMail({
    to: user.email,
    subject: "Verify your SurveyXchange account",
    html: verificationEmailTemplate(user.firstName, code),
  });
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    let institutionId: string | undefined;
    if (input.institutionName) {
      const institution = await authRepository.findOrCreateInstitution(
        input.institutionName,
        input.country
      );
      institutionId = institution.id;
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      academicLevel: input.academicRole,
      institutionId,
      country: input.country,
      starterPoints: env.STARTER_POINTS,
    });

    await sendVerificationCode(user);

    return { email: user.email };
  },

  async verifyEmail(input: VerifyEmailInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) throw ApiError.badRequest("Invalid verification request");
    if (user.emailVerified) throw ApiError.badRequest("Email is already verified");

    const token = await authRepository.findLatestEmailVerificationToken(user.id);
    if (!token) throw ApiError.badRequest("Verification code expired. Please request a new one.");

    if (token.attempts >= MAX_OTP_ATTEMPTS) {
      throw ApiError.tooManyRequests("Too many incorrect attempts. Please request a new code.");
    }

    const isDevBypass = isDevelopment && input.code === DEV_BYPASS_OTP;
    if (!isDevBypass && hashToken(input.code) !== token.codeHash) {
      await authRepository.incrementVerificationAttempts(token.id);
      throw ApiError.badRequest("Incorrect verification code");
    }

    await authRepository.consumeEmailVerificationToken(token.id);
    await authRepository.markEmailVerified(user.id, env.STARTER_POINTS);
    await sendMail({
      to: user.email,
      subject: "Welcome to SurveyXchange",
      html: welcomeEmailTemplate(user.firstName),
    });

    return { verified: true };
  },

  async resendCode(input: ResendCodeInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || user.emailVerified) {
      return { sent: true };
    }
    await sendVerificationCode(user);
    return { sent: true };
  },

  async login(input: LoginInput, meta: RequestMeta) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw ApiError.forbidden(`Account locked. Try again in ${minutesLeft} minute(s).`);
    }

    const passwordValid = await comparePassword(input.password, user.passwordHash);
    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil =
        attempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : null;
      await authRepository.incrementFailedLogin(user.id, lockedUntil);
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.status === "SUSPENDED" || user.status === "BANNED") {
      throw ApiError.forbidden("Your account has been suspended. Contact support.");
    }

    await authRepository.resetFailedLogin(user.id);
    const tokens = await issueTokens(user, input.rememberMe, meta);

    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshTokenRaw: string, meta: RequestMeta) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenRaw);
    } catch {
      throw ApiError.unauthorized("Invalid or expired session. Please log in again.");
    }

    const tokenHash = hashToken(refreshTokenRaw);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized("Invalid or expired session. Please log in again.");
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user) throw ApiError.unauthorized("Account no longer exists");

    const tokens = await issueTokens(user, true, meta);
    await authRepository.revokeRefreshToken(stored.id, tokens.refreshToken);

    return { user: toPublicUser(user), ...tokens };
  },

  async logout(refreshTokenRaw: string | undefined) {
    if (!refreshTokenRaw) return;
    const tokenHash = hashToken(refreshTokenRaw);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);
    if (stored && !stored.revokedAt) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) return { sent: true };

    await authRepository.invalidatePasswordResetTokens(user.id);
    const rawToken = generateOpaqueToken();
    await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000),
    });

    const resetUrl = `${env.WEB_URL}/reset-password?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: "Reset your SurveyXchange password",
      html: passwordResetEmailTemplate(user.firstName, resetUrl),
    });

    return { sent: true };
  },

  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashToken(input.token);
    const stored = await authRepository.findValidPasswordResetToken(tokenHash);
    if (!stored) throw ApiError.badRequest("This reset link is invalid or has expired");

    const user = await authRepository.findUserById(stored.userId);
    if (!user) throw ApiError.badRequest("This reset link is invalid or has expired");

    const passwordHash = await hashPassword(input.password);
    await authRepository.updatePassword(user.id, passwordHash);
    await authRepository.consumePasswordResetToken(stored.id);
    await authRepository.revokeAllUserRefreshTokens(user.id);

    await sendMail({
      to: user.email,
      subject: "Your password was changed",
      html: passwordChangedEmailTemplate(user.firstName),
    });

    return { reset: true };
  },

  async loginWithGoogle(input: GoogleAuthInput, meta: RequestMeta) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw ApiError.internal("Google login is not configured");
    }
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: input.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw ApiError.unauthorized("Invalid Google token");
    }

    let user = await authRepository.findUserByGoogleId(payload.sub);
    if (!user) {
      user = await authRepository.findUserByEmail(payload.email);
      if (user && !user.googleId) {
        user = await authRepository.linkGoogleId(user.id, payload.sub);
      }
    }

    if (!user) {
      user = await authRepository.createUser({
        firstName: payload.given_name ?? "New",
        lastName: payload.family_name ?? "User",
        email: payload.email,
        googleId: payload.sub,
        emailVerified: true,
        starterPoints: env.STARTER_POINTS,
      });
    } else if (!user.emailVerified) {
      user = await authRepository.markEmailVerified(user.id, env.STARTER_POINTS);
    }

    const tokens = await issueTokens(user, true, meta);
    return { user: toPublicUser(user), ...tokens };
  },
};

export { toPublicUser };
