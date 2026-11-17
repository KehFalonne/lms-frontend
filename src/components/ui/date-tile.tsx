import { CalendarDays, ClipboardList, FileQuestion } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Mini calendar page — day number + month, urgency-tinted
 * (red overdue · amber today · blue upcoming) with a kind badge.
 */
export function DateTile({
  iso,
  kind,
}: {
  iso: string | null;
  kind?: "assignment" | "assessment";
}) {
  if (!iso) {
    return (
      <span className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
        <CalendarDays className="h-4 w-4" aria-hidden />
      </span>
    );
  }

  const date = new Date(iso);
  const now = new Date();
  const overdue = date.getTime() < now.getTime() && date.toDateString() !== now.toDateString();
  const isToday = date.toDateString() === now.toDateString();
  const tone = overdue
    ? "bg-danger/10 text-danger ring-danger/25"
    : isToday
      ? "bg-warning/15 text-warning ring-warning/30"
      : "bg-primary/[0.07] text-primary ring-primary/15";

  return (
    <span
      className={cn(
        "relative flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-xl ring-1 leading-none",
        tone,
      )}
    >
      <span className="text-[17px] font-bold tabular-nums">{date.getDate()}</span>
      <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-widest opacity-90">
        {date.toLocaleString("en", { month: "short" })}
      </span>
      {kind && (
        <span
          aria-hidden
          className={cn(
            "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white",
            kind === "assignment" ? "bg-info" : "bg-primary",
          )}
        >
          {kind === "assignment" ? (
            <ClipboardList className="h-2.5 w-2.5" />
          ) : (
            <FileQuestion className="h-2.5 w-2.5" />
          )}
        </span>
      )}
    </span>
  );
}
