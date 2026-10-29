import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { prisma } from "@/database/prisma";

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized("Authentication required");
  return req.user.id;
}

export const dashboardController = {
  statistics: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);

    const [user, completedCount, publishedCount, bookmarksCount, achievementsCount] =
      await Promise.all([
        prisma.user.findUniqueOrThrow({
          where: { id: userId },
          select: { points: true, reputation: true },
        }),
        prisma.pollResponse.count({ where: { userId } }),
        prisma.poll.count({ where: { creatorId: userId, deletedAt: null } }),
        prisma.pollBookmark.count({ where: { userId } }),
        prisma.userAchievement.count({ where: { userId } }),
      ]);

    return sendSuccess(res, {
      data: {
        points: user.points,
        reputation: user.reputation,
        completedPolls: completedCount,
        publishedPolls: publishedCount,
        bookmarks: bookmarksCount,
        achievements: achievementsCount,
      },
    });
  }),

  recommendations: asyncHandler(async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const completedPollIds = (
      await prisma.pollResponse.findMany({ where: { userId }, select: { pollId: true } })
    ).map((r) => r.pollId);

    const matched = await prisma.poll.findMany({
      where: {
        deletedAt: null,
        status: "LIVE",
        deadline: { gt: new Date() },
        creatorId: { not: userId },
        id: { notIn: completedPollIds },
        OR: [
          user.academicLevel ? { targetAcademicLevel: user.academicLevel } : {},
          user.country ? { targetCountry: user.country } : {},
          { targetAcademicLevel: null, targetCountry: null },
        ],
      },
      include: {
        category: true,
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    return sendSuccess(res, { data: matched });
  }),
};
