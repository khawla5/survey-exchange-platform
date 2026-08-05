import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { ApiError } from "@/shared/ApiError";
import { verifyAccessToken } from "@/utils/jwt";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

  if (!token) {
    return next(ApiError.unauthorized("Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      emailVerified: payload.emailVerified,
    };
    next();
  } catch {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      emailVerified: payload.emailVerified,
    };
  } catch {
    // Ignore invalid tokens on optional-auth routes; treat as anonymous.
  }
  next();
}

export function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.emailVerified) {
    return next(ApiError.forbidden("Please verify your email to continue"));
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}
