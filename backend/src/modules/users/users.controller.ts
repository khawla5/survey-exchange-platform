import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { usersService } from "@/modules/users/users.service";
import { clearAuthCookies } from "@/utils/cookies";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from "@/modules/users/users.validation";

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized("Authentication required");
  return req.user.id;
}

export const usersController = {
  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.getMe(requireUserId(req));
    return sendSuccess(res, { data: user });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const input = updateProfileSchema.parse(req.body);
    const user = await usersService.updateProfile(requireUserId(req), input);
    return sendSuccess(res, { message: "Profile updated", data: user });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const input = changePasswordSchema.parse(req.body);
    const result = await usersService.changePassword(requireUserId(req), input);
    return sendSuccess(res, { message: "Password changed successfully", data: result });
  }),

  sessions: asyncHandler(async (req: Request, res: Response) => {
    const sessions = await usersService.listSessions(requireUserId(req));
    return sendSuccess(res, { data: sessions });
  }),

  revokeSession: asyncHandler(async (req: Request, res: Response) => {
    const result = await usersService.revokeSession(requireUserId(req), req.params.id);
    return sendSuccess(res, { message: "Session revoked", data: result });
  }),

  deleteAccount: asyncHandler(async (req: Request, res: Response) => {
    const input = deleteAccountSchema.parse(req.body);
    const result = await usersService.deleteAccount(requireUserId(req), input);
    clearAuthCookies(res);
    return sendSuccess(res, { message: "Account deleted", data: result });
  }),
};
