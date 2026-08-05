import { prisma } from "@/database/prisma";
import { achievementsRepository } from "@/modules/achievements/achievements.repository";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { pointsService } from "@/modules/points/points.service";

interface AchievementCriteria {
  type: "surveys_completed" | "surveys_published";
  threshold: number;
}

function parseCriteria(value: unknown): AchievementCriteria | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "threshold" in value &&
    typeof (value as { threshold: unknown }).threshold === "number"
  ) {
    return value as AchievementCriteria;
  }
  return null;
}

export const achievementsService = {
  async list(userId: string | undefined) {
    const [all, unlocked] = await Promise.all([
      achievementsRepository.listAll(),
      userId ? achievementsRepository.listUnlockedByUser(userId) : Promise.resolve([]),
    ]);
    const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

    return all.map((achievement) => ({
      ...achievement,
      unlocked: unlockedMap.has(achievement.id),
      unlockedAt: unlockedMap.get(achievement.id) ?? null,
    }));
  },

  async checkAndUnlock(userId: string, event: "surveys_completed" | "surveys_published") {
    const all = await achievementsRepository.listAll();
    const relevant = all.filter((a) => parseCriteria(a.criteria)?.type === event);
    if (relevant.length === 0) return [];

    const currentCount =
      event === "surveys_completed"
        ? await achievementsRepository.countCompletedSurveys(userId)
        : await achievementsRepository.countPublishedSurveys(userId);

    const unlockedNow = [];
    for (const achievement of relevant) {
      const criteria = parseCriteria(achievement.criteria);
      if (!criteria || currentCount < criteria.threshold) continue;

      const already = await achievementsRepository.isUnlocked(userId, achievement.id);
      if (already) continue;

      await achievementsRepository.unlock(userId, achievement.id);

      if (achievement.pointsReward > 0) {
        await prisma.$transaction((tx) =>
          pointsService.credit(tx, {
            userId,
            type: "EARN_ADMIN_GRANT",
            amount: achievement.pointsReward,
            description: `Achievement unlocked: ${achievement.name}`,
            referenceType: "achievement",
            referenceId: achievement.id,
          })
        );
      }

      await notificationsService.notify({
        userId,
        title: "Achievement unlocked!",
        message: `You unlocked "${achievement.name}" — +${achievement.pointsReward} pts`,
        type: "ACHIEVEMENT_UNLOCKED",
        priority: "NORMAL",
        actionUrl: "/achievements",
        metadata: { achievementId: achievement.id, icon: achievement.icon, color: achievement.color },
      });

      unlockedNow.push(achievement);
    }

    return unlockedNow;
  },
};
