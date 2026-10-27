"use client";
import { Bell, CheckCheck } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function NotificationsPage() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
  );
}

function NotificationsContent() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const unreadQuery = useUnreadNotificationsCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount = unreadQuery.data ?? 0;

  function setOpen(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="All your activity and course updates."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              onClick={() => markAll.mutate()}
              loading={markAll.isPending}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="New notifications will appear here."
        />
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <Card className="divide-border divide-y">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={(id) => markRead.mutate(id)}
              onNavigate={() => setOpen(false)}
              compact
            />
          ))}
        </Card>
      )}
    </div>
  );
}
