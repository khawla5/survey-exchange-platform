import { Request, Response } from "express";
import { asyncHandler } from "@/shared/asyncHandler";
import { sendSuccess } from "@/shared/response";
import { prisma } from "@/database/prisma";

export const categoriesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
    });
    return sendSuccess(res, { data: categories });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    return sendSuccess(res, { data: category });
  }),
};
