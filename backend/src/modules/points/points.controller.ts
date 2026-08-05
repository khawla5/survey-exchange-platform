import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { pointsService } from "@/modules/points/points.service";
import { prisma } from "@/database/prisma";
import { z } from "zod";

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized("Authentication required");
  return req.user.id;
}

export const pointsController = {
  balance: asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: requireUserId(req) },
      select: { points: true, reputation: true },
    });
    return sendSuccess(res, { data: user });
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    const query = historyQuerySchema.parse(req.query);
    const result = await pointsService.history(requireUserId(req), query.page, query.limit);
    return sendSuccess(res, {
      data: result.items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / query.limit)),
      },
    });
  }),
};
