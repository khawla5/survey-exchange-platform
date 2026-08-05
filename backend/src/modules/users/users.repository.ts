import { prisma } from "@/database/prisma";
import { Prisma } from "@prisma/client";

export const usersRepository = {
  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { institution: true },
    });
  },

  updateProfile(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: "DELETED" },
    });
  },

  listSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: "desc" },
    });
  },

  findSession(id: string, userId: string) {
    return prisma.session.findFirst({ where: { id, userId } });
  },

  revokeSession(id: string) {
    return prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  revokeAllRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
