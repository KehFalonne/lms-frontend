"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "./notification-item";
import {
  useMarkRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "../hooks/useNotifications";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const countQuery = useUnreadNotificationsCount();
  const listQuery = useNotifications();
  const markRead = useMarkRead();

  const unreadCount = countQuery.data ?? 0;
  const notifications = (listQuery.data?.data ?? []).slice(0, 5);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="bg-danger absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="border-border bg-background animate-slide-in absolute top-full right-0 z-40 mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-md border shadow-lg sm:w-96">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <span className="text-muted-foreground text-xs">{unreadCount} unread</span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-muted-foreground p-6 text-center text-sm">
                You&apos;re all caught up.
              </p>
            ) : (
              <div className="divide-border divide-y">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={(id) => markRead.mutate(id)}
                    onNavigate={() => setOpen(false)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-border border-t p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-primary hover:bg-surface block w-full rounded-sm px-3 py-2 text-center text-sm"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
