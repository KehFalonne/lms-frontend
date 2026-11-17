"use client";

import { MessagesSquare } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { NewTopicDialog } from "@/features/discussions/components/new-topic-dialog";
import { TopicCard } from "@/features/discussions/components/topic-card";
import {
  useCourseForums,
  useForumTopics,
} from "@/features/discussions/hooks/useDiscussions";
import { cn } from "@/lib/utils/cn";

export default function CourseDiscussionsPageClient({ courseId }: { courseId: string }) {
  const { data, isLoading, isError, refetch } = useCourseForums(courseId);
  const forums = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (forums.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="No discussions yet"
        description="Your lecturer hasn't opened any discussion forums for this course."
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {forums.map((forum) => (
        <ForumSection key={forum.id} forum={forum} courseId={courseId} />
      ))}
    </div>
  );
}

function ForumSection({
  forum,
  courseId,
}: {
  forum: { id: string; title: string; description: string; isLocked: boolean };
  courseId: string;
}) {
  const { data, isLoading, isError, refetch } = useForumTopics(forum.id);
  const topics = data?.data ?? [];

  return (
    <GlassCard>
      {/* Forum header */}
      <div className="flex flex-col items-start justify-between gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
              forum.isLocked
                ? "bg-muted text-muted-foreground ring-border"
                : "bg-primary/10 text-primary ring-primary/20",
            )}
          >
            <MessagesSquare className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="break-words text-sm font-semibold leading-6">{forum.title}</h2>
            <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-5">
              {forum.description || "Open forum for this course"}
            </p>
            {!isLoading && (
              <p className="text-muted-foreground mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em]">
                <span className="tabular-nums">{topics.length}</span>{" "}
                {topics.length === 1 ? "topic" : "topics"}
                {forum.isLocked && (
                  <span className="ml-2 text-muted-foreground/70">· Locked</span>
                )}
              </p>
            )}
          </div>
        </div>
        {!forum.isLocked && (
          <div className="w-full shrink-0 sm:w-auto">
            <NewTopicDialog forumId={forum.id} />
          </div>
        )}
      </div>

      {/* Topics */}
      <div className="p-3 sm:p-4">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && topics.length === 0 && (
          <EmptyState
            icon={MessagesSquare}
            title="No topics yet"
            description="Be the first to start a conversation."
          />
        )}
        {!isLoading && !isError && topics.length > 0 && (
          <div className="space-y-2">
            {topics.map((t) => (
              <TopicCard key={t.id} topic={t} courseId={courseId} />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
