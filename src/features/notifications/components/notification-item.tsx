"use client";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  UserPlus,
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
  ENROLLMENT: UserPlus,
  SYSTEM: Bell,
  CA_INVIGILATOR_MESSAGE: ShieldAlert,
};

const TINTS: Record<NotificationType, string> = {
  ANNOUNCEMENT: "bg-warning/10 text-warning ring-warning/20",
  ASSIGNMENT: "bg-info/10 text-info ring-info/20",
  ASSESSMENT: "bg-primary/10 text-primary ring-primary/20",
  GRADE: "bg-success/10 text-success ring-success/20",
  DISCUSSION: "bg-info/10 text-info ring-info/20",
  ENROLLMENT: "bg-primary/10 text-primary ring-primary/20",
  SYSTEM: "bg-muted text-muted-foreground ring-border",
  CA_INVIGILATOR_MESSAGE: "bg-warning/10 text-warning ring-warning/20",
};

const ACCENTS: Record<NotificationType, string> = {
  ANNOUNCEMENT: "border-l-warning",
  ASSIGNMENT: "border-l-info",
  ASSESSMENT: "border-l-primary",
  GRADE: "border-l-success",
  DISCUSSION: "border-l-violet-500",
  ENROLLMENT: "border-l-primary",
  CA_INVIGILATOR_MESSAGE: "border-l-warning",
  SYSTEM: "border-l-border",
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
    case "enrollment": {
      const cId = data.courseOfferingId as string | undefined;
      return cId ? `/lecturer/courses/${cId}/students` : null;
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
        "flex items-start gap-3 border-l-2 p-4 transition-colors",
        ACCENTS[notification.type] ?? ACCENTS.SYSTEM,
        !notification.isRead ? "bg-primary/[0.07]" : "bg-background",
        href && "hover:bg-primary/[0.04]"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
          TINTS[notification.type] ?? TINTS.SYSTEM
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="text-sm leading-tight font-semibold">{notification.title}</p>
          {!notification.isRead && (
            <span
              className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              aria-label="Unread"
            />
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
          {notification.message}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {relativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && onMarkRead && (!href || !compact) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
        >
          {compact ? "Read" : "Mark read"}
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
