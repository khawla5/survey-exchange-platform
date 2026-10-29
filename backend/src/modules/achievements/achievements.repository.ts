import { prisma } from "@/database/prisma";

export const achievementsRepository = {
  listAll() {
    return prisma.achievement.findMany({ where: { visible: true }, orderBy: { pointsReward: "asc" } });
  },

  listUnlockedByUser(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
  },

  isUnlocked(userId: string, achievementId: string) {
    return prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });
  },

  unlock(userId: string, achievementId: string) {
    return prisma.userAchievement.create({ data: { userId, achievementId } });
  },

  countCompletedPolls(userId: string) {
    return prisma.pollResponse.count({ where: { userId } });
  },

  countPublishedPolls(userId: string) {
    return prisma.poll.count({
      where: { creatorId: userId, deletedAt: null, status: { in: ["LIVE", "COMPLETED"] } },
    });
  },
};
