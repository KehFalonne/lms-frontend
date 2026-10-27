"use client";
import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Lock, MessageSquare, Pin } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ChatInput } from "@/features/discussions/components/chat-input";
import { ChatMessage } from "@/features/discussions/components/chat-message";
import { DateDivider, dateKey } from "@/features/discussions/components/date-divider";
import { useTopic, useTopicPosts } from "@/features/discussions/hooks/useDiscussions";
import { relativeTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/auth.store";
import type { DiscussionPost } from "@/features/discussions/types/discussion.types";

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; topicId: string }>;
}) {
  const { courseId, topicId } = use(params);
  const topicQ = useTopic(topicId);
  const postsQ = useTopicPosts(topicId);

  const currentUser = useAuthStore((s) => s.user);
  const [replyTo, setReplyTo] = useState<DiscussionPost | null>(null);

  const topic = topicQ.data?.data;
  const posts = postsQ.data?.data ?? [];

  // ── Auto-scroll to bottom on new post ────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  useEffect(() => {
    if (posts.length > lastCountRef.current) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    lastCountRef.current = posts.length;
  }, [posts.length]);

  // ── Map for quote lookups ────────────────────────────────────────
  const postsById = useMemo(() => {
    const m = new Map<string, DiscussionPost>();
    for (const p of posts) m.set(p.id, p);
    return m;
  }, [posts]);

  // ── Loading ──────────────────────────────────────────────────────
  if (topicQ.isLoading || postsQ.isLoading) {
    return (
      <div className="flex h-[80vh] flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="mt-auto h-32 w-full" />
      </div>
    );
  }

  if (topicQ.isError) {
    return (
      <ErrorState
        title="Could not load topic"
        description={(topicQ.error as Error)?.message ?? "Please try again."}
        onRetry={() => topicQ.refetch()}
      />
    );
  }

  if (postsQ.isError) {
    return (
      <ErrorState
        title="Could not load messages"
        description={(postsQ.error as Error)?.message ?? "The messages request failed."}
        onRetry={() => postsQ.refetch()}
      />
    );
  }

  if (!topic) return <ErrorState title="Topic not found" />;

  return (
    <div className="-mx-4 -my-4 flex h-[calc(100vh-8rem)] flex-col sm:-mx-6 sm:-my-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="border-border bg-background border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}/discussions`}
            className="hover:bg-surface shrink-0 rounded-md p-1"
            aria-label="Back to discussions"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <MessageSquare className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-base font-semibold">{topic.title}</h1>
              {topic.isPinned && <Pin className="text-warning h-3.5 w-3.5 shrink-0" />}
              {topic.isLocked && (
                <Lock className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              )}
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {topic.createdBy
                ? `${topic.createdBy.firstName} ${topic.createdBy.lastName}`
                : "Unknown"}{" "}
              · {posts.length} {posts.length === 1 ? "message" : "messages"}
            </p>
          </div>
        </div>
      </header>

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="bg-surface/30 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
      >
        {/* Pinned opening message from the topic */}
        <Card className="border-primary/20 bg-primary/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Avatar
                size="sm"
                fallback={
                  topic.createdBy
                    ? `${topic.createdBy.firstName[0] ?? ""}${topic.createdBy.lastName[0] ?? ""}`.toUpperCase()
                    : "?"
                }
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">
                    {topic.createdBy
                      ? `${topic.createdBy.firstName} ${topic.createdBy.lastName}`
                      : "Unknown"}
                  </p>
                  <Badge variant="primary" className="text-[10px]">
                    Topic
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {relativeTime(topic.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                  {topic.body}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {posts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No replies yet"
            description="Be the first to respond."
          />
        ) : (
          <div className="mx-auto max-w-3xl">
            {renderMessages(posts, postsById, currentUser?.id, setReplyTo)}
          </div>
        )}
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      {topic.isLocked ? (
        <div className="border-border bg-background text-muted-foreground border-t px-4 py-3 text-center text-sm">
          <Lock className="mr-1 inline h-4 w-4" />
          This topic is locked. You cannot reply.
        </div>
      ) : (
        <ChatInput
          topicId={topicId}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

const GROUP_WINDOW_MS = 5 * 60 * 1000;

function renderMessages(
  posts: DiscussionPost[],
  postsById: Map<string, DiscussionPost>,
  currentUserId: string | undefined,
  onReply: (post: DiscussionPost) => void
) {
  const elements: React.ReactNode[] = [];
  let prevDateKey = "";
  let prevPost: DiscussionPost | null = null;

  for (const post of posts) {
    const thisDateKey = dateKey(post.createdAt);
    if (thisDateKey !== prevDateKey) {
      elements.push(<DateDivider key={`divider-${thisDateKey}`} date={post.createdAt} />);
      prevDateKey = thisDateKey;
      prevPost = null;
    }

    const isOwn = post.author?.id === currentUserId;
    const grouped =
      !!prevPost &&
      prevPost.author?.id === post.author?.id &&
      Math.abs(
        new Date(post.createdAt).getTime() - new Date(prevPost.createdAt).getTime()
      ) < GROUP_WINDOW_MS;

    elements.push(
      <ChatMessage
        key={post.id}
        post={post}
        parentPost={post.parentPost ? (postsById.get(post.parentPost) ?? null) : null}
        isOwn={isOwn}
        grouped={grouped}
        onReply={onReply}
      />
    );

    prevPost = post;
  }

  return elements;
}
