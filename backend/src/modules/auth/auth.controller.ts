import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { authService } from "@/modules/auth/auth.service";
import { setAuthCookies, clearAuthCookies } from "@/utils/cookies";
import {
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  registerSchema,
  resendCodeSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/modules/auth/auth.validation";

function requestMeta(req: Request) {
  return { ip: req.ip, userAgent: req.headers["user-agent"] };
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Account created. Check your email for a verification code.",
      data: result,
    });
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const input = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(input);
    return sendSuccess(res, { message: "Email verified successfully", data: result });
  }),

  resendCode: asyncHandler(async (req: Request, res: Response) => {
    const input = resendCodeSchema.parse(req.body);
    const result = await authService.resendCode(input);
    return sendSuccess(res, { message: "If an account exists, a new code was sent", data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(input, requestMeta(req));
    setAuthCookies(res, accessToken, refreshToken);
    return sendSuccess(res, {
      message: "Logged in successfully",
      data: { user, accessToken },
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) throw ApiError.unauthorized("No active session");
    const { user, accessToken, refreshToken } = await authService.refresh(token, requestMeta(req));
    setAuthCookies(res, accessToken, refreshToken);
    return sendSuccess(res, { message: "Session refreshed", data: { user, accessToken } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken as string | undefined;
    await authService.logout(token);
    clearAuthCookies(res);
    return sendSuccess(res, { message: "Logged out successfully" });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const input = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(input);
    return sendSuccess(res, {
      message: "If an account exists, a reset link was sent",
      data: result,
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const input = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(input);
    return sendSuccess(res, { message: "Password reset successfully", data: result });
  }),

  google: asyncHandler(async (req: Request, res: Response) => {
    const input = googleAuthSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.loginWithGoogle(
      input,
      requestMeta(req)
    );
    setAuthCookies(res, accessToken, refreshToken);
    return sendSuccess(res, { message: "Logged in with Google", data: { user, accessToken } });
  }),
};
