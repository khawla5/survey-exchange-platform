import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { prisma } from "@/database/prisma";

const querySchema = z.object({
  period: z.enum(["weekly", "monthly", "alltime"]).default("alltime"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function periodStart(period: "weekly" | "monthly" | "alltime"): Date | null {
  const now = new Date();
  if (period === "weekly") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === "monthly") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

export const leaderboardController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { period, limit } = querySchema.parse(req.query);
    const since = periodStart(period);

    if (!since) {
      const users = await prisma.user.findMany({
        where: { deletedAt: null, hideLeaderboard: false, status: "ACTIVE" },
        orderBy: { points: "desc" },
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          points: true,
          reputation: true,
          country: true,
          institution: { select: { name: true, verified: true } },
        },
      });
      return sendSuccess(res, {
        data: users.map((u, i) => ({ rank: i + 1, ...u, periodPoints: u.points })),
      });
    }

    const grouped = await prisma.transaction.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since }, amount: { gt: 0 } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: limit,
    });

    const userIds = grouped.map((g) => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, deletedAt: null, hideLeaderboard: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        points: true,
        reputation: true,
        country: true,
        institution: { select: { name: true, verified: true } },
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const ranked = grouped
      .filter((g) => userMap.has(g.userId))
      .map((g, i) => ({
        rank: i + 1,
        ...userMap.get(g.userId)!,
        periodPoints: g._sum.amount ?? 0,
      }));

    return sendSuccess(res, { data: ranked });
  }),
};
