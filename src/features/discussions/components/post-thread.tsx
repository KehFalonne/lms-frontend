"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";
import type { ThreadedPost } from "../types/discussion.types";
import { PostForm } from "./post-form";

interface Props {
  post: ThreadedPost;
  topicId: string;
  depth?: number;
}

export function PostThread({ post, topicId, depth = 0 }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [hidden, setHidden] = useState(false);

  const hasChildren = post.children.length > 0;
  const author = post.author;
  const initials = author
    ? `${author.firstName[0] ?? ""}${author.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  if (hidden) return null;

  return (
    <div
      className={cn(
        // Mobile: only show visual indent for first 2 depths; deeper levels
        // collapse into a "continues a thread" style
        depth > 0 && depth <= 2 && "border-border border-l-2 pl-2 sm:pl-4",
        depth > 0 && depth <= 2 && "ml-1 sm:ml-3",
        depth > 2 && "sm:border-border ml-0 sm:ml-3 sm:border-l-2 sm:pl-4",
        depth === 0 && "mt-4"
      )}
    >
      {depth > 2 && (
        <p className="mb-1.5 ml-1 text-[10px] uppercase tracking-wide text-muted-foreground sm:hidden">
          Deep reply
        </p>
      )}
      <div className="border-border bg-background rounded-md border p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Avatar size="sm" fallback={initials} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                {author ? `${author.firstName} ${author.lastName}` : "Unknown"}
              </p>
              <span className="text-muted-foreground text-xs">
                {relativeTime(post.createdAt)}
              </span>
              {post.isEdited && (
                <span className="text-muted-foreground text-xs italic">(edited)</span>
              )}
            </div>

            <p className="mt-1.5 text-sm whitespace-pre-line">{post.body}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!replying && (
                <Button variant="ghost" size="sm" onClick={() => setReplying(true)}>
                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                  Reply
                </Button>
              )}
              {hasChildren && (
                <Button variant="ghost" size="sm" onClick={() => setCollapsed((c) => !c)}>
                  {collapsed ? (
                    <ChevronRight className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="mr-1 h-3.5 w-3.5" />
                  )}
                  {collapsed
                    ? `${post.children.length} reply${post.children.length === 1 ? "" : "ies"}`
                    : "Hide replies"}
                </Button>
              )}
              {depth > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHidden(true)}
                  className="text-muted-foreground"
                >
                  Hide thread
                </Button>
              )}
            </div>

            {replying && (
              <div className="mt-3">
                <PostForm
                  topicId={topicId}
                  parentPost={post.id}
                  compact
                  onPosted={() => setReplying(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="mt-2 space-y-2">
          {post.children.map((child) => (
            <PostThread key={child.id} post={child} topicId={topicId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
