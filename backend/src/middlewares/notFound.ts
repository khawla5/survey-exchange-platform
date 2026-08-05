import { Request, Response } from "express";
import { sendError } from "@/shared/response";

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}
