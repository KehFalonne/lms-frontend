import { Megaphone, Pin } from "lucide-react";

import { relativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Announcement } from "../types/announcement.types";

/**
 * Announcement card — date-forward record with author monogram,
 * pinned state and unread accent.
 */
export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const pinned = Boolean(announcement.isPinned);
  const unread = !announcement.isRead;
  const authorName = announcement.createdBy
    ? `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`.trim()
    : "System";
  const initials = announcement.createdBy
    ? `${announcement.createdBy.firstName?.[0] ?? ""}${announcement.createdBy.lastName?.[0] ?? ""}`.toUpperCase()
    : "SY";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 p-4 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 ring-primary/10 backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-slate-800/75 dark:ring-white/5",
        pinned && "ring-warning/25 dark:ring-warning/20",
        unread && "ring-primary/25 dark:ring-primary/30",
      )}
    >
      {/* Unread rail */}
      {unread && (
        <span
          aria-hidden
          className="absolute left-0 top-4 h-10 w-1 rounded-r-full bg-primary"
        />
      )}

      <div className="flex items-start gap-4">
        {/* Author monogram / megaphone for system */}
        {announcement.createdBy ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold uppercase tracking-wide text-primary ring-1 ring-primary/20">
            {initials}
          </span>
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
            <Megaphone className="h-5 w-5" aria-hidden />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-sm font-semibold leading-5">{announcement.title}</h3>
            {pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest text-warning ring-1 ring-warning/25">
                <Pin className="h-3 w-3" aria-hidden />
                Pinned
              </span>
            )}
            {unread && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest text-primary ring-1 ring-primary/20">
                New
              </span>
            )}
          </div>

          <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-foreground/90">
            {announcement.body}
          </p>

          <div className="border-border/60 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span>{authorName}</span>
            <span>{relativeTime(announcement.publishAt ?? announcement.createdAt)}</span>
            <span className="tabular-nums">{announcement.readCount} read</span>
          </div>
        </div>
      </div>
    </article>
  );
}
