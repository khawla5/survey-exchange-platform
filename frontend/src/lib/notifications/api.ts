import { apiClient, ApiEnvelope } from "@/lib/api/client";
import { Notification } from "@/types/gamification";

export async function fetchNotifications(page: number, limit = 20) {
  const { data } = await apiClient.get<
    ApiEnvelope<{ items: Notification[]; unreadCount: number }>
  >("/notifications", { params: { page, limit } });
  return data.data;
}

export async function markNotificationRead(id: string) {
  await apiClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await apiClient.put("/notifications/read-all");
}

export async function deleteNotification(id: string) {
  await apiClient.delete(`/notifications/${id}`);
}
