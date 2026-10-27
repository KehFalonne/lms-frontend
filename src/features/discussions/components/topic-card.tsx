import Link from "next/link";
import { Lock, MessageSquare, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { relativeTime } from "@/lib/utils/format";
import type { DiscussionTopic } from "../types/discussion.types";

export function TopicCard({
  topic,
  courseId,
}: {
  topic: DiscussionTopic;
  courseId: string;
}) {
  return (
    <Link href={`/courses/${courseId}/discussions/${topic.id}`}>
      <Card className="hover:border-primary p-4 transition-all hover:shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
            <MessageSquare className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-medium">{topic.title}</h3>
              {topic.isPinned && (
                <Badge variant="warning">
                  <Pin className="mr-1 h-3 w-3" />
                  Pinned
                </Badge>
              )}
              {topic.isLocked && (
                <Badge variant="default">
                  <Lock className="mr-1 h-3 w-3" />
                  Locked
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {topic.body}
            </p>

            <p className="text-muted-foreground mt-2 text-xs">
              {topic.createdBy
                ? `${topic.createdBy.firstName} ${topic.createdBy.lastName}`
                : "Unknown"}{" "}
              · {relativeTime(topic.createdAt)} · {topic.postCount} posts
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
