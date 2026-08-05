import { NotificationPriority, NotificationType, Prisma } from "@prisma/client";
import { notificationsRepository } from "@/modules/notifications/notifications.repository";
import { emitToUser } from "@/realtime/socket";

interface NotifyInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Prisma.InputJsonValue;
}

export const notificationsService = {
  async notify(input: NotifyInput) {
    const notification = await notificationsRepository.create(input);
    emitToUser(input.userId, "notification:new", notification);
    return notification;
  },

  async list(userId: string, page: number, limit: number, unreadOnly: boolean) {
    return notificationsRepository.list(userId, page, limit, unreadOnly);
  },

  async markRead(id: string, userId: string) {
    await notificationsRepository.markRead(id, userId);
    return { read: true };
  },

  async markAllRead(userId: string) {
    await notificationsRepository.markAllRead(userId);
    return { read: true };
  },

  async remove(id: string, userId: string) {
    await notificationsRepository.remove(id, userId);
    return { deleted: true };
  },
};
