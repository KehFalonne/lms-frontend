import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
  isValid,
} from "date-fns";

/**
 * Safely parse a date value. Returns null for anything invalid:
 * null, undefined, empty string, or a string that Date can't parse.
 */
function safeParseDate(input: string | Date | null | undefined): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const d = input instanceof Date ? input : new Date(input);
  return isValid(d) ? d : null;
}

export function formatDate(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = safeParseDate(date);
  return d ? format(d, "MMM d, yyyy") : fallback;
}

export function formatDateTime(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = safeParseDate(date);
  return d ? format(d, "MMM d, yyyy · h:mm a") : fallback;
}

export function formatTime(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = safeParseDate(date);
  return d ? format(d, "h:mm a") : fallback;
}

export function relativeTime(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  const d = safeParseDate(date);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : fallback;
}

export function dueLabel(date: string | Date | null | undefined) {
  const d = safeParseDate(date);
  if (!d) return { label: "—", variant: "default" as const };
  if (isPast(d)) return { label: "Overdue", variant: "danger" as const };
  if (isToday(d)) return { label: "Due today", variant: "warning" as const };
  if (isTomorrow(d)) return { label: "Due tomorrow", variant: "warning" as const };
  return { label: `Due ${formatDate(d)}`, variant: "default" as const };
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
