/**
 * Deadline urgency chip — Overdue / Today / Tomorrow / "in Nd" — shared by
 * the student and lecturer dashboards.
 */
export function DueChip({ iso }: { iso: string | null }) {
  if (!iso) {
    return (
      <span className="text-muted-foreground bg-muted shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase">
        No date
      </span>
    );
  }
  const now = Date.now();
  const due = new Date(iso).getTime();
  const sameDay = new Date(iso).toDateString() === new Date().toDateString();
  const tomorrow =
    new Date(due).toDateString() ===
    new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

  if (due < now && !sameDay) {
    return (
      <span className="bg-danger/10 text-danger ring-danger/20 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase ring-1">
        Overdue
      </span>
    );
  }
  if (sameDay) {
    return (
      <span className="bg-warning/15 text-warning ring-warning/25 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase ring-1">
        Today
      </span>
    );
  }
  if (tomorrow) {
    return (
      <span className="bg-warning/10 text-warning ring-warning/20 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase ring-1">
        Tomorrow
      </span>
    );
  }
  const days = Math.ceil((due - now) / (24 * 60 * 60 * 1000));
  return (
    <span className="text-muted-foreground bg-muted shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase tabular-nums">
      in {days}d
    </span>
  );
}

export function relativeDue(iso: string): string {
  const due = new Date(iso).getTime();
  const sameDay = new Date(iso).toDateString() === new Date().toDateString();
  const days = Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000));
  if (due < Date.now() && !sameDay) return "overdue";
  if (sameDay) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
