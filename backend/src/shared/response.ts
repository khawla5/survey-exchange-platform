import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessPayload<T> {
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  statusCode?: number;
}

export function sendSuccess<T>(res: Response, payload: SuccessPayload<T> = {}) {
  const { message = "Success", data = null, pagination, statusCode = 200 } = payload;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: pagination ?? null,
    errors: null,
    timestamp: new Date().toISOString(),
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors: Record<string, string[]> | null = null
) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    pagination: null,
    errors,
    timestamp: new Date().toISOString(),
  });
}
