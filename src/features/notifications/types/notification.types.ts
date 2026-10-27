export type NotificationType =
  "ANNOUNCEMENT" | "ASSIGNMENT" | "ASSESSMENT" | "GRADE" | "DISCUSSION" | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string | null;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
