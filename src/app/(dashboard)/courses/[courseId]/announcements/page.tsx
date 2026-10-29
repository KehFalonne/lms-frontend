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
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
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
      {announcements.map((a) => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
    </div>
  );
}
