import { get, post } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type { Notification } from "../types/notification.types";

export async function getNotifications(params?: { unread?: boolean }) {
  const query = params?.unread ? "?unread=true" : "";
  return get<ApiResponse<Notification[]>>(`/notifications/${query}`);
}

export async function markNotificationRead(id: string) {
  return post<ApiResponse<Notification>>(`/notifications/${id}/read/`);
}

export async function markAllNotificationsRead() {
  return post<ApiResponse<{ updated: number }>>("/notifications/read-all/");
}
