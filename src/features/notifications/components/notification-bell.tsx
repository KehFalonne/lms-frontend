"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Bell, BellOff, CheckCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { NotificationItem } from "./notification-item";
import {
  useMarkRead,
  useMarkAllRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "../hooks/useNotifications";

export function NotificationBell() {
  const pathname = usePathname();
  const notificationsHref = pathname.startsWith("/invigilator")
    ? "/invigilator/notifications"
    : "/notifications";
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<
    "ALL" | "ACADEMICS" | "ASSIGNMENTS" | "DISCUSSIONS"
  >("ALL");
  const ref = useRef<HTMLDivElement>(null);

  const countQuery = useUnreadNotificationsCount();
  const listQuery = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const unreadCount = countQuery.data ?? 0;
  const notifications = (listQuery.data?.data ?? []).slice(0, 8);
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "ALL") return true;
    if (filter === "ACADEMICS") {
      return notification.type === "GRADE" || notification.type === "ASSESSMENT";
    }
    if (filter === "ASSIGNMENTS") return notification.type === "ASSIGNMENT";
    return notification.type === "DISCUSSION";
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
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
        <aside
          role="dialog"
          aria-label="Notifications"
          className="animate-notification-drop ring-primary/10 absolute top-full right-0 z-50 mt-2 flex max-h-[min(38rem,calc(100dvh-5rem))] w-[min(22rem,calc(100vw-2rem))] origin-top-right flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-[0_24px_80px_-24px_hsl(222_47%_8%/0.55)] ring-1 backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/90 dark:ring-white/5 max-sm:fixed max-sm:inset-x-2 max-sm:top-16 max-sm:bottom-2 max-sm:mt-0 max-sm:h-auto max-sm:max-h-none max-sm:w-auto max-sm:origin-top"
        >
          <div className="border-border/60 flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="bg-primary/10 text-primary ring-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1">
                <Bell className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">Notifications</h2>
                <p className="text-muted-foreground truncate text-[11px]">
                  {unreadCount > 0
                    ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                    : "You're all caught up"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg px-2 text-xs"
                  onClick={() => markAll.mutate()}
                  loading={markAll.isPending}
                >
                  <CheckCheck className="mr-1 h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border-border/60 flex gap-1.5 overflow-x-auto border-b px-3 py-2.5">
            {(
              [
                ["ALL", "All"],
                ["ACADEMICS", "Academics"],
                ["ASSIGNMENTS", "Assignments"],
                ["DISCUSSIONS", "Discussions"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                  filter === value
                    ? "bg-primary text-primary-foreground ring-primary/20 border-transparent ring-1"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto">
            <NotificationList
              isLoading={listQuery.isLoading}
              notifications={filteredNotifications}
              totalCount={notifications.length}
              onMarkRead={(id) => markRead.mutate(id)}
              onNavigate={() => setOpen(false)}
            />
          </div>

          <div className="border-border/60 bg-background/95 border-t p-3 backdrop-blur">
            <Link
              href={notificationsHref}
              onClick={() => setOpen(false)}
              className="group border-primary/15 bg-primary/[0.06] hover:border-primary/30 hover:bg-primary/[0.1] text-foreground flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  View all notifications
                </span>
                <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                  See your complete activity history
                </span>
              </span>
              <ArrowRight className="text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}

function NotificationList({
  isLoading,
  notifications,
  totalCount,
  onMarkRead,
  onNavigate,
}: {
  isLoading: boolean;
  notifications: import("../types/notification.types").Notification[];
  totalCount: number;
  onMarkRead: (id: string) => void;
  onNavigate: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-[4.5rem] w-full rounded-xl" />
        <Skeleton className="h-[4.5rem] w-full rounded-xl" />
        <Skeleton className="h-[4.5rem] w-full rounded-xl" />
      </div>
    );
  }
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="bg-muted text-muted-foreground ring-border/70 flex h-12 w-12 items-center justify-center rounded-2xl ring-1">
          <BellOff className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {totalCount === 0 ? "You're all caught up" : "Nothing in this category"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {totalCount === 0
              ? "New activity will show up here."
              : "Try another filter to see the rest."}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="divide-border/70 divide-y">
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
