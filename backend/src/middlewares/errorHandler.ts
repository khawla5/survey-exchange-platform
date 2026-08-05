import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/shared/ApiError";
import { sendError } from "@/shared/response";
import { logger } from "@/utils/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "root";
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return sendError(res, 422, "Validation failed", errors);
  }

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    }
    return sendError(res, err.statusCode, err.message, err.errors ?? null);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendError(res, 409, "A record with this value already exists");
    }
    if (err.code === "P2025") {
      return sendError(res, 404, "Resource not found");
    }
  }

  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  return sendError(res, 500, "Internal server error");
}
