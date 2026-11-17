"use client";

import { use, useEffect } from "react";
import { Megaphone } from "lucide-react";

import { AnnouncementCard } from "@/features/announcements/components/announcement-card";
import {
  useCourseAnnouncements,
  useMarkAnnouncementRead,
} from "@/features/announcements/hooks/useAnnouncements";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export default function CourseAnnouncementsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading, isError, refetch } = useCourseAnnouncements(courseId);
  const announcements = data?.data ?? [];
  const markRead = useMarkAnnouncementRead();

  useEffect(() => {
    if (!announcements.length) return;
    // fire-and-forget for each unread
    announcements.filter((a) => !a.isRead).forEach((a) => markRead.mutate(a.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements.length]);

  const unread = announcements.filter((a) => !a.isRead).length;
  const pinned = announcements.filter((a) => a.isPinned).length;

  // Pinned first, then newest
  const ordered = [...announcements].sort((a, b) => {
    if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
    const ta = new Date(a.publishAt ?? a.createdAt).getTime();
    const tb = new Date(b.publishAt ?? b.createdAt).getTime();
    return tb - ta;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No announcements yet"
        description="Course announcements from your lecturer will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        <SummaryChip label="Total" value={announcements.length} tone="primary" />
        <SummaryChip label="Pinned" value={pinned} tone="warning" />
        <SummaryChip label="New" value={unread} tone="info" />
      </div>

      {ordered.map((a) => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "warning" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1",
        tone === "primary" && "bg-primary/10 text-primary ring-primary/20",
        tone === "warning" && "bg-warning/10 text-warning ring-warning/25",
        tone === "info" && "bg-info/10 text-info ring-info/20",
      )}
    >
      {label}
      <span className="tabular-nums opacity-80">{value}</span>
    </span>
  );
}
