"use client";

import { MessageSquare } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NewTopicDialog } from "@/features/discussions/components/new-topic-dialog";
import { TopicCard } from "@/features/discussions/components/topic-card";
import {
  useCourseForums,
  useForumTopics,
} from "@/features/discussions/hooks/useDiscussions";

export default function CourseDiscussionsPageClient({ courseId }: { courseId: string }) {
  const { data, isLoading, isError, refetch } = useCourseForums(courseId);
  const forums = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (forums.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No discussions yet"
        description="Your lecturer hasn't opened any discussion forums for this course."
      />
    );
  }

  return (
    <div className="space-y-6">
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
    <Card>
      <CardHeader className="border-border flex flex-col items-start justify-between gap-3 border-b sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0">
          <CardTitle className="text-base break-words">{forum.title}</CardTitle>
          {forum.description && (
            <p className="text-muted-foreground mt-1 text-xs">{forum.description}</p>
          )}
        </div>
        {!forum.isLocked && (
          <div className="w-full shrink-0 sm:w-auto">
            <NewTopicDialog forumId={forum.id} />
          </div>
        )}
      </CardHeader>
      <div className="p-4">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && topics.length === 0 && (
          <EmptyState
            icon={MessageSquare}
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
    </Card>
  );
}
