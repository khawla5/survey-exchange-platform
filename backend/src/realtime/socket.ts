import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { env } from "@/config/env";
import { verifyAccessToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";

let io: SocketIOServer | undefined;

function extractToken(socket: Socket): string | undefined {
  const authToken = socket.handshake.auth?.token as string | undefined;
  if (authToken) return authToken;

  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.WEB_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = extractToken(socket);
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
    logger.debug({ userId, socketId: socket.id }, "Socket connected");

    socket.on("disconnect", () => {
      logger.debug({ userId, socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}
