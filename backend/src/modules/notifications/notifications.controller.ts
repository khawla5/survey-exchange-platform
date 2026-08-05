import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { ApiError } from "@/shared/ApiError";
import { notificationsService } from "@/modules/notifications/notifications.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().optional().default(false),
});

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized("Authentication required");
  return req.user.id;
}

export const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const userId = requireUserId(req);
    const result = await notificationsService.list(userId, query.page, query.limit, query.unreadOnly);
    return sendSuccess(res, {
      data: { items: result.items, unreadCount: result.unreadCount },
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / query.limit)),
      },
    });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markRead(req.params.id, requireUserId(req));
    return sendSuccess(res, { data: result });
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAllRead(requireUserId(req));
    return sendSuccess(res, { data: result });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.remove(req.params.id, requireUserId(req));
    return sendSuccess(res, { data: result });
  }),
};
