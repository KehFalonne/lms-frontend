"use client";
import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Lock, MessageSquare, Pin } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
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
      <header className="border-border/70 bg-background/95 flex h-14 items-center gap-3 border-b px-3 backdrop-blur sm:h-16 sm:px-5">
        <Link
          href={`/courses/${courseId}/discussions`}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Back to discussions"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>

        {topic.createdBy ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[10px] font-bold uppercase tracking-wide text-primary ring-1 ring-primary/15">
            {`${topic.createdBy.firstName?.[0] ?? ""}${topic.createdBy.lastName?.[0] ?? ""}`.toUpperCase()}
          </span>
        ) : (
          <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-base font-semibold">{topic.title}</h1>
            {topic.isPinned && <Pin className="text-warning h-3.5 w-3.5 shrink-0" aria-hidden />}
            {topic.isLocked && (
              <Lock className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
          </div>
          <p className="text-muted-foreground truncate text-[10px] font-semibold uppercase tracking-[0.16em]">
            <span className="tabular-nums">{posts.length}</span>{" "}
            {posts.length === 1 ? "message" : "messages"}
          </p>
        </div>
      </header>

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 [background-image:radial-gradient(hsl(var(--muted-foreground)/0.08)_1.1px,transparent_1.1px)] [background-size:22px_22px] sm:px-6"
      >
        {/* Pinned opening message from the topic */}
        <article className="border-primary/20 bg-primary/[0.05] dark:bg-primary/[0.08] dark:border-primary/25 mb-6 rounded-2xl border p-4 ring-1 ring-primary/10">
          <div className="flex items-start gap-3">
            <Avatar
              size="sm"
              fallback={
                topic.createdBy
                  ? `${topic.createdBy.firstName[0] ?? ""}${topic.createdBy.lastName[0] ?? ""}`.toUpperCase()
                  : "?"
              }
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold">
                  {topic.createdBy
                    ? `${topic.createdBy.firstName} ${topic.createdBy.lastName}`
                    : "Unknown"}
                </p>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest ring-1 ring-primary/20">
                  Topic
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {relativeTime(topic.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                {topic.body}
              </p>
            </div>
          </div>
        </article>

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
        <div className="border-border/70 bg-background/95 flex items-center justify-center gap-2 border-t px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <Lock className="h-4 w-4" aria-hidden />
          This topic is locked — you cannot reply.
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
