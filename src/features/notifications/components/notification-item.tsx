"use client";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Megaphone,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";
import type { Notification, NotificationType } from "../types/notification.types";

const ICONS: Record<NotificationType, typeof Bell> = {
  ANNOUNCEMENT: Megaphone,
  ASSIGNMENT: ClipboardList,
  ASSESSMENT: FileQuestion,
  GRADE: GraduationCap,
  DISCUSSION: MessageSquare,
  SYSTEM: Bell,
};

/**
 * Best-effort route for a notification. Returns null if we can't build one.
 * The backend sends `data` with the IDs we need.
 */
function getNotificationHref(n: Notification): string | null {
  const data = n.data ?? {};

  switch (n.entityType) {
    case "assignment": {
      const id = data.assignmentId as string | undefined;
      return id ? `/assignments/${id}` : null;
    }
    case "assessment": {
      const id = data.assessmentId as string | undefined;
      return id ? `/assessments/${id}` : null;
    }
    case "assessment_attempt": {
      const aId = data.assessmentId as string | undefined;
      return aId ? `/assessments/${aId}` : null;
    }
    case "announcement": {
      const cId = data.courseOfferingId as string | undefined;
      return cId ? `/courses/${cId}/announcements` : null;
    }
    case "topic": {
      const fId = data.forumId as string | undefined;
      const cId = data.courseOfferingId as string | undefined;
      const tId = data.topicId as string | undefined;
      return cId && tId ? `/courses/${cId}/discussions/${tId}` : null;
    }
    case "grade": {
      const cId = data.courseOfferingId as string | undefined;
      return cId ? `/courses/${cId}/grades` : null;
    }
    default:
      return null;
  }
}

interface Props {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onNavigate?: () => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
  compact,
}: Props) {
  const Icon = ICONS[notification.type] ?? Bell;
  const href = getNotificationHref(notification);

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 transition-colors",
        !notification.isRead && "bg-primary/5",
        href && "hover:bg-surface"
      )}
    >
      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-tight font-medium">{notification.title}</p>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
          {notification.message}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {relativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && onMarkRead && !compact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
        >
          Mark read
        </Button>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      onClick={() => {
        if (!notification.isRead && onMarkRead) {
          onMarkRead(notification.id);
        }
        onNavigate?.();
      }}
    >
      {content}
    </Link>
  );
}
