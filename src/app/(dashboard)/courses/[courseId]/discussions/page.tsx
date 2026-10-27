"use client";
import { use } from "react";
import { MessageSquare } from "lucide-react";

import { TopicCard } from "@/features/discussions/components/topic-card";
import { NewTopicDialog } from "@/features/discussions/components/new-topic-dialog";
import {
  useCourseForums,
  useForumTopics,
} from "@/features/discussions/hooks/useDiscussions";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function CourseDiscussionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
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
  const { data, isLoading } = useForumTopics(forum.id);
  const topics = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="border-border flex flex-row items-start justify-between gap-4 border-b">
        <div>
          <CardTitle className="text-base">{forum.title}</CardTitle>
          {forum.description && (
            <p className="text-muted-foreground mt-1 text-xs">{forum.description}</p>
          )}
        </div>
        {!forum.isLocked && <NewTopicDialog forumId={forum.id} />}
      </CardHeader>
      <div className="p-4">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {!isLoading && topics.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="No topics yet"
            description="Be the first to start a conversation."
          />
        )}
        {!isLoading && topics.length > 0 && (
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
