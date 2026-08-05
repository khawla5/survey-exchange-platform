import { NotificationPriority, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";

export const notificationsRepository = {
  create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    actionUrl?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.notification.create({ data });
  },

  async list(userId: string, page: number, limit: number, unreadOnly: boolean) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    };
    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, total, unreadCount };
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  remove(id: string, userId: string) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  },
};
