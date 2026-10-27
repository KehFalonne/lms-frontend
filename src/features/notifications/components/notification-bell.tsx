"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "./notification-item";
import {
  useMarkRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "../hooks/useNotifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const countQuery = useUnreadNotificationsCount();
  const listQuery = useNotifications();
  const markRead = useMarkRead();

  const unreadCount = countQuery.data ?? 0;
  const notifications = (listQuery.data?.data ?? []).slice(0, 8);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative h-10 w-10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="bg-danger absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          {/* Desktop dropdown */}
          <div className="animate-slide-in border-border bg-background absolute top-full right-0 z-40 mt-1 hidden w-96 rounded-md border shadow-lg sm:block">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-muted-foreground text-xs">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <NotificationList
              isLoading={listQuery.isLoading}
              notifications={notifications}
              onMarkRead={(id) => markRead.mutate(id)}
              onNavigate={() => setOpen(false)}
            />
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

          {/* Mobile bottom sheet */}
          <div className="fixed inset-0 z-50 sm:hidden">
            <div
              className="animate-fade-in absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="animate-slide-in border-border bg-background pb-safe absolute right-0 bottom-0 left-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t">
              <div className="border-border flex items-center justify-between border-b px-4 py-3">
                <p className="text-base font-semibold">Notifications</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NotificationList
                  isLoading={listQuery.isLoading}
                  notifications={notifications}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onNavigate={() => setOpen(false)}
                  mobile
                />
              </div>
              <div className="border-border border-t p-3">
                <Link href="/notifications" onClick={() => setOpen(false)}>
                  <Button className="w-full" variant="outline">
                    View all notifications
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationList({
  isLoading,
  notifications,
  onMarkRead,
  onNavigate,
  mobile,
}: {
  isLoading: boolean;
  notifications: import("../types/notification.types").Notification[];
  onMarkRead: (id: string) => void;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (notifications.length === 0) {
    return (
      <p className="text-muted-foreground p-8 text-center text-sm">
        You&apos;re all caught up.
      </p>
    );
  }
  return (
    <div className="divide-border divide-y">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead}
          onNavigate={onNavigate}
          compact
        />
      ))}
    </div>
  );
}
