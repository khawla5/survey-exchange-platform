import { createApp } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { prisma } from "@/database/prisma";
import { redis } from "@/database/redis";
import { initSocketServer } from "@/realtime/socket";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`PollXchange API listening on http://localhost:${env.PORT}`);
});

initSocketServer(server);

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    redis.disconnect();
    logger.info("Shutdown complete");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});
