import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { prisma } from "@/database/prisma";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const institutionsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = listQuerySchema.parse(req.query);
    const [items, total] = await Promise.all([
      prisma.institution.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { members: true, polls: true } } },
      }),
      prisma.institution.count({ where: { deletedAt: null } }),
    ]);
    return sendSuccess(res, {
      data: items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const institution = await prisma.institution.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!institution) throw ApiError.notFound("Institution not found");

    const [memberCount, livePollCount, completedPollCount, totalPoints, topContributors] =
      await Promise.all([
        prisma.user.count({ where: { institutionId: institution.id, deletedAt: null } }),
        prisma.poll.count({
          where: { institutionId: institution.id, status: "LIVE", deletedAt: null },
        }),
        prisma.poll.count({
          where: { institutionId: institution.id, status: "COMPLETED", deletedAt: null },
        }),
        prisma.user.aggregate({
          where: { institutionId: institution.id, deletedAt: null },
          _sum: { points: true },
        }),
        prisma.user.findMany({
          where: { institutionId: institution.id, deletedAt: null, hideLeaderboard: false },
          orderBy: { points: "desc" },
          take: 5,
          select: { id: true, firstName: true, lastName: true, avatar: true, points: true },
        }),
      ]);

    return sendSuccess(res, {
      data: {
        ...institution,
        stats: {
          memberCount,
          livePollCount,
          completedPollCount,
          totalPoints: totalPoints._sum.points ?? 0,
        },
        topContributors,
      },
    });
  }),

  members: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = listQuerySchema.parse(req.query);
    const where = { institutionId: req.params.id, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { points: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          points: true,
          reputation: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return sendSuccess(res, {
      data: items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  }),
};
