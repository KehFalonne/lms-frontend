import Link from "next/link";
import { Lock, MessageSquare, Pin } from "lucide-react";

import { relativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { DiscussionTopic } from "../types/discussion.types";

/**
 * Forum topic row — author monogram, pin/lock states, post count.
 */
export function TopicCard({
  topic,
  courseId,
}: {
  topic: DiscussionTopic;
  courseId: string;
}) {
  const initials = topic.createdBy
    ? `${topic.createdBy.firstName?.[0] ?? ""}${topic.createdBy.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <Link
      href={`/courses/${courseId}/discussions/${topic.id}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <article
        className={cn(
          "flex items-start gap-3 rounded-2xl border border-white/60 bg-white/85 p-3.5 ring-1 ring-primary/10 backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.6)] dark:border-white/10 dark:bg-slate-800/75 dark:ring-white/5",
          topic.isPinned && "ring-warning/25 dark:ring-warning/20",
        )}
      >
        {/* Author monogram */}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[10px] font-bold uppercase tracking-wide text-primary ring-1 ring-primary/15">
          {initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="min-w-0 truncate text-sm font-semibold leading-5 group-hover:text-primary transition-colors">
              {topic.title}
            </h3>
            {topic.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest text-warning ring-1 ring-warning/25">
                <Pin className="h-3 w-3" aria-hidden />
                Pinned
              </span>
            )}
            {topic.isLocked && (
              <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest">
                <Lock className="h-3 w-3" aria-hidden />
                Locked
              </span>
            )}
          </div>

          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">{topic.body}</p>

          <div className="text-muted-foreground mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-2 pb-0 text-[8px] font-semibold uppercase tracking-[0.16em]">
            <span>
              {topic.createdBy
                ? `${topic.createdBy.firstName} ${topic.createdBy.lastName}`
                : "Unknown"}
            </span>
            <span>{relativeTime(topic.createdAt)}</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageSquare className="h-3 w-3" aria-hidden />
              {topic.postCount} {topic.postCount === 1 ? "reply" : "replies"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
