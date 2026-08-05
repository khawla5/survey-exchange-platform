import { ApiError } from "@/shared/ApiError";
import { comparePassword, hashPassword } from "@/utils/crypto";
import { usersRepository } from "@/modules/users/users.repository";
import { sendMail } from "@/shared/mail/mailer";
import { passwordChangedEmailTemplate } from "@/shared/mail/templates";
import type {
  ChangePasswordInput,
  DeleteAccountInput,
  UpdateProfileInput,
} from "@/modules/users/users.validation";

export const usersService = {
  async getMe(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return usersRepository.updateProfile(userId, input);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await usersRepository.findById(userId);
    if (!user?.passwordHash) {
      throw ApiError.badRequest("This account does not use a password (signed in via Google)");
    }
    const valid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Current password is incorrect");

    const newHash = await hashPassword(input.newPassword);
    await usersRepository.updatePassword(userId, newHash);
    await usersRepository.revokeAllRefreshTokens(userId);
    await sendMail({
      to: user.email,
      subject: "Your password was changed",
      html: passwordChangedEmailTemplate(user.firstName),
    });
    return { changed: true };
  },

  async listSessions(userId: string) {
    return usersRepository.listSessions(userId);
  },

  async revokeSession(userId: string, sessionId: string) {
    const session = await usersRepository.findSession(sessionId, userId);
    if (!session) throw ApiError.notFound("Session not found");
    await usersRepository.revokeSession(sessionId);
    return { revoked: true };
  },

  async deleteAccount(userId: string, input: DeleteAccountInput) {
    const user = await usersRepository.findById(userId);
    if (!user?.passwordHash) {
      throw ApiError.badRequest("Cannot verify identity for this account type");
    }
    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Incorrect password");

    await usersRepository.softDelete(userId);
    await usersRepository.revokeAllRefreshTokens(userId);
    return { deleted: true };
  },
};
