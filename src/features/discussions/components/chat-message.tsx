"use client";
import { Reply as ReplyIcon } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import type { DiscussionPost } from "../types/discussion.types";

interface ChatMessageProps {
  post: DiscussionPost;
  parentPost: DiscussionPost | null;
  isOwn: boolean;
  grouped: boolean;
  onReply: (post: DiscussionPost) => void;
}

/** Deterministic hue per author, stable across sessions. */
const HUES = [
  "bg-primary/10 text-primary ring-primary/20",
  "bg-info/10 text-info ring-info/20",
  "bg-success/10 text-success ring-success/20",
  "bg-warning/10 text-warning ring-warning/25",
];

function hueFor(id: string | undefined): string {
  if (!id) return HUES[0];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return HUES[Math.abs(hash) % HUES.length];
}

export function ChatMessage({
  post,
  parentPost,
  isOwn,
  grouped,
  onReply,
}: ChatMessageProps) {
  const author = post.author;
  const initials = author
    ? `${author.firstName[0] ?? ""}${author.lastName[0] ?? ""}`.toUpperCase()
    : "?";
  const time = format(new Date(post.createdAt), "h:mm a");

  return (
    <div
      className={cn(
        "group flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
        grouped ? "mt-1" : "mt-4",
      )}
    >
      {/* Avatar column — reserved space keeps the rhythm aligned */}
      <div className="w-9 shrink-0">
        {!isOwn && !grouped && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-bold uppercase tracking-wide ring-1",
              hueFor(author?.id),
            )}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "relative max-w-[78%] sm:max-w-[68%]",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {!grouped && !isOwn && author && (
          <p className="text-muted-foreground mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
            {author.firstName}
          </p>
        )}

        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 transition-shadow",
            isOwn
              ? "bg-[linear-gradient(150deg,hsl(221_83%_55%)_0%,hsl(226_72%_48%)_100%)] text-white shadow-[0_12px_28px_-12px_hsl(221_83%_53%/0.7)] ring-1 ring-white/20 rounded-br-md"
              : "bg-background ring-1 ring-border/70 shadow-[0_4px_14px_-8px_hsl(222_47%_22%/0.35)] rounded-bl-md dark:bg-slate-800/80 dark:ring-white/10",
          )}
        >
          {/* Quoted reply */}
          {parentPost && (
            <div
              className={cn(
                "mb-1.5 rounded-lg border-l-2 px-2 py-1.5 text-xs",
                isOwn
                  ? "border-white/50 bg-white/10"
                  : "border-primary bg-primary/[0.06]",
              )}
            >
              <p
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-[0.16em]",
                  isOwn ? "text-white/85" : "text-primary",
                )}
              >
                {parentPost.author
                  ? `${parentPost.author.firstName} ${parentPost.author.lastName}`
                  : "Unknown"}
              </p>
              <p
                className={cn(
                  "line-clamp-2 leading-5",
                  isOwn ? "text-white/75" : "text-muted-foreground",
                )}
              >
                {parentPost.body}
              </p>
            </div>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-line">{post.body}</p>

          <p
            className={cn(
              "mt-1 text-right text-[9px] font-medium tabular-nums leading-none",
              isOwn ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {post.isEdited && <span className="mr-1 italic opacity-80">edited</span>}
            {time}
          </p>
        </div>

        {/* Reply action — always visible on touch, hover/focus on pointers */}
        <button
          type="button"
          onClick={() => onReply(post)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-full p-2 shadow-md outline-none",
            "group/reply bg-background ring-1 ring-border/70 transition-all duration-200 hover:scale-110 hover:bg-primary hover:ring-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary",
            "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:scale-110",
            isOwn ? "-left-10" : "-right-10",
          )}
          aria-label="Reply to message"
        >
          <ReplyIcon
            className="text-muted-foreground group-hover/reply:text-primary-foreground h-3.5 w-3.5 transition-colors"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
