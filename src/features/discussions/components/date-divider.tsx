import { format } from "date-fns";

import { cn } from "@/lib/utils/cn";

function dateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return format(d, "EEEE");
  return format(d, "MMM d, yyyy");
}

export function DateDivider({ date }: { date: string }) {
  return (
    <div className="my-4 flex items-center justify-center gap-3" aria-hidden>
      <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-border" />
      <span
        className={cn(
          "rounded-full bg-background/80 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em]",
          "text-muted-foreground ring-1 ring-border/70 backdrop-blur-sm",
        )}
      >
        {dateLabel(new Date(date))}
      </span>
      <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}

/** Return YYYY-MM-DD key for grouping. */
export function dateKey(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
