import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { apiRateLimiter } from "@/middlewares/rateLimiter";
import { notFoundHandler } from "@/middlewares/notFound";
import { errorHandler } from "@/middlewares/errorHandler";
import { sendSuccess } from "@/shared/response";
import authRoutes from "@/modules/auth/auth.routes";
import usersRoutes from "@/modules/users/users.routes";
import pollsRoutes from "@/modules/polls/polls.routes";
import categoriesRoutes from "@/modules/categories/categories.routes";
import pointsRoutes from "@/modules/points/points.routes";
import dashboardRoutes from "@/modules/dashboard/dashboard.routes";
import notificationsRoutes from "@/modules/notifications/notifications.routes";
import achievementsRoutes from "@/modules/achievements/achievements.routes";
import leaderboardRoutes from "@/modules/leaderboard/leaderboard.routes";
import institutionsRoutes from "@/modules/institutions/institutions.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_URL,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));
  app.use("/api", apiRateLimiter);

  app.get("/health", (_req: Request, res: Response) => {
    return sendSuccess(res, { message: "OK", data: { uptime: process.uptime() } });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/polls", pollsRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/points", pointsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/achievements", achievementsRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/institutions", institutionsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
