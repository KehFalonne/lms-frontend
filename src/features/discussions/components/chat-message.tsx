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
        grouped ? "mt-0.5" : "mt-3"
      )}
    >
      {/* Avatar column */}
      {isOwn ? (
        <div className="w-8 shrink-0" />
      ) : (
        <div className="w-8 shrink-0">
          {!grouped && <Avatar size="sm" fallback={initials} />}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "relative max-w-[80%] sm:max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!grouped && !isOwn && author && (
          <p className="text-muted-foreground mb-0.5 px-1 text-xs font-medium">
            {author.firstName} {author.lastName}
          </p>
        )}

        <div
          className={cn(
            "rounded-2xl px-3 py-2 shadow-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-surface text-foreground rounded-bl-sm"
          )}
        >
          {/* Quoted reply */}
          {parentPost && (
            <div
              className={cn(
                "mb-1.5 rounded border-l-2 px-2 py-1 text-xs",
                isOwn
                  ? "border-primary-foreground/50 bg-primary-foreground/10"
                  : "border-primary/60 bg-primary/10"
              )}
            >
              <p
                className={cn(
                  "font-semibold",
                  isOwn ? "text-primary-foreground/90" : "text-primary"
                )}
              >
                {parentPost.author
                  ? `${parentPost.author.firstName} ${parentPost.author.lastName}`
                  : "Unknown"}
              </p>
              <p
                className={cn(
                  "line-clamp-2",
                  isOwn ? "text-primary-foreground/75" : "text-muted-foreground"
                )}
              >
                {parentPost.body}
              </p>
            </div>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-line">{post.body}</p>

          <p
            className={cn(
              "mt-0.5 text-right text-[10px] leading-none",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {post.isEdited && <span className="mr-1 italic">edited</span>}
            {time}
          </p>
        </div>

        {/* Hover reply button */}
        <button
          type="button"
          onClick={() => onReply(post)}
          className={cn(
            "bg-background absolute top-1/2 -translate-y-1/2 rounded-full p-1.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100",
            isOwn ? "-left-9" : "-right-9"
          )}
          aria-label="Reply"
        >
          <ReplyIcon className="text-muted-foreground h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
