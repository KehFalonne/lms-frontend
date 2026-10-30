export type WSEventType =
  | "connected"
  | "notification.created"
  | "grade.published"
  | "announcement.published"
  | "discussion.post_created"
  | "ca.monitoring_updated";

export interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
}

export interface NotificationCreatedPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface GradePublishedPayload {
  gradeId: string;
  gradeItemId: string;
  score: string | null;
  maxScore: string;
}

export interface AnnouncementPublishedPayload {
  announcementId: string;
  title: string;
  courseOfferingId: string;
}

export interface DiscussionPostCreatedPayload {
  topicId: string;
  postId: string;
  forumId: string;
  courseOfferingId: string;
  authorId: string;
  parentPostId: string | null;
}
