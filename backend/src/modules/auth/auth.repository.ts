import { prisma } from "@/database/prisma";
import { AcademicLevel, Prisma } from "@prisma/client";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findUserByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  },

  async findOrCreateInstitution(name: string, country?: string) {
    const existing = await prisma.institution.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (existing) return existing;
    return prisma.institution.create({ data: { name, country } });
  },

  createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash?: string;
    googleId?: string;
    academicLevel?: AcademicLevel;
    institutionId?: string;
    country?: string;
    emailVerified?: boolean;
    starterPoints: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: data.passwordHash,
          googleId: data.googleId,
          academicLevel: data.academicLevel,
          institutionId: data.institutionId,
          country: data.country,
          emailVerified: data.emailVerified ?? false,
          status: data.emailVerified ? "ACTIVE" : undefined,
          points: data.emailVerified ? data.starterPoints : 0,
        },
      });

      if (data.emailVerified && data.starterPoints > 0) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: "EARN_STARTER_BONUS",
            amount: data.starterPoints,
            balanceBefore: 0,
            balanceAfter: data.starterPoints,
            description: "Welcome bonus for verifying your email",
          },
        });
      }

      return user;
    });
  },

  linkGoogleId(userId: string, googleId: string) {
    return prisma.user.update({ where: { id: userId }, data: { googleId } });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  markEmailVerified(userId: string, starterPoints: number) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          status: "ACTIVE",
          points: { increment: starterPoints },
        },
      });
      await tx.transaction.create({
        data: {
          userId,
          type: "EARN_STARTER_BONUS",
          amount: starterPoints,
          balanceBefore: user.points - starterPoints,
          balanceAfter: user.points,
          description: "Welcome bonus for verifying your email",
        },
      });
      return user;
    });
  },

  incrementFailedLogin(userId: string, lockedUntil: Date | null) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lockedUntil: lockedUntil ?? undefined,
      },
    });
  },

  resetFailedLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  },

  createEmailVerificationToken(data: { userId: string; codeHash: string; expiresAt: Date }) {
    return prisma.emailVerificationToken.create({ data });
  },

  findLatestEmailVerificationToken(userId: string) {
    return prisma.emailVerificationToken.findFirst({
      where: { userId, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  },

  invalidateEmailVerificationTokens(userId: string) {
    return prisma.emailVerificationToken.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  },

  incrementVerificationAttempts(id: string) {
    return prisma.emailVerificationToken.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },

  consumeEmailVerificationToken(id: string) {
    return prisma.emailVerificationToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  },

  createPasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({ data });
  },

  invalidatePasswordResetTokens(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  },

  findValidPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, consumedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  consumePasswordResetToken(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  },

  createSession(data: Prisma.SessionCreateInput) {
    return prisma.session.create({ data });
  },

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    userAgent?: string;
    ip?: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeRefreshToken(id: string, replacedByToken?: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedByToken },
    });
  },

  revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
