import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

// Redis is optional until a feature depends on it (rate-limit store, OTP cache, etc.).
// When REDIS_URL isn't configured, `redis` is null and callers must handle that.
export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: 3 })
  : null;

if (redis) {
  redis.on("error", (err) => {
    logger.error({ err }, "Redis connection error");
  });

  redis.on("connect", () => {
    logger.info("Redis connected");
  });
} else {
  logger.warn("REDIS_URL not configured — Redis-dependent features are disabled");
}
