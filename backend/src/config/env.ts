import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  APP_URL: z.string().url().default("http://localhost:4000"),
  WEB_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Optional until a feature actually depends on Redis (rate-limit store, OTP cache, etc.).
  REDIS_URL: z.string().optional().default(""),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  JWT_REFRESH_EXPIRES_IN_REMEMBER: z.string().default("90d"),

  COOKIE_SECRET: z.string().min(32, "COOKIE_SECRET must be at least 32 characters"),

  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  SMTP_FROM: z.string().default("PollXchange <no-reply@pollxchange.com>"),

  AWS_REGION: z.string().optional().default(""),
  AWS_ACCESS_KEY_ID: z.string().optional().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(""),
  AWS_S3_BUCKET: z.string().optional().default(""),

  STARTER_POINTS: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
