import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { achievementsService } from "@/modules/achievements/achievements.service";

export const achievementsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const achievements = await achievementsService.list(req.user?.id);
    return sendSuccess(res, { data: achievements });
  }),
};
