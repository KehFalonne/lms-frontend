"use client";
import { Bell, CheckCheck } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/features/notifications/hooks/useNotifications";
import type { Notification } from "@/features/notifications/types/notification.types";

export default function NotificationsPage() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
  );
}

export function NotificationsContent() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const unreadQuery = useUnreadNotificationsCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount = unreadQuery.data ?? 0;

  // Bucket by recency — Today / This week / Older
  const groups = groupByRecency(notifications);

  return (
    <div>
      {/* Library header */}
      <header className="mb-5 sm:mb-6">
        <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
          <span aria-hidden className="bg-primary/50 h-px w-6" />
          Stay informed
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
              Every mark, announcement, reply and deadline — your feed in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary ring-primary/20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tabular-nums ring-1">
                {unreadCount} unread
              </span>
            )}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAll.mutate()}
                loading={markAll.isPending}
                className="rounded-xl"
              >
                <CheckCheck className="mr-1.5 h-4 w-4" aria-hidden />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {/* Empty */}
      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="New notifications will appear here."
        />
      )}

      {/* Grouped feed */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="space-y-5">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <h2 className="text-muted-foreground mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
                <span aria-hidden className="bg-border h-px w-4" />
                {label}
                <span className="text-muted-foreground/60 tabular-nums">
                  {items.length}
                </span>
              </h2>
              <GlassCard className="divide-border/70 divide-y">
                {items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={(id) => markRead.mutate(id)}
                    onNavigate={() => undefined}
                    compact
                  />
                ))}
              </GlassCard>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByRecency(
  items: Notification[]
): { label: string; items: Notification[] }[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  const today: Notification[] = [];
  const thisWeek: Notification[] = [];
  const older: Notification[] = [];

  for (const n of items) {
    const t = new Date(n.createdAt).getTime();
    if (t >= todayMs) today.push(n);
    else if (now - t <= 7 * day) thisWeek.push(n);
    else older.push(n);
  }

  return [
    { label: "Today", items: today },
    { label: "This week", items: thisWeek },
    { label: "Earlier", items: older },
  ].filter((g) => g.items.length > 0);
}
