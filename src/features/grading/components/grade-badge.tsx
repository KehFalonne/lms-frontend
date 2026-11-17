import { cn } from "@/lib/utils/cn";

const LETTER_TONE: Record<string, string> = {
  A: "bg-success/10 text-success ring-success/25",
  B: "bg-info/10 text-info ring-info/25",
  C: "bg-primary/10 text-primary ring-primary/20",
  D: "bg-warning/10 text-warning ring-warning/25",
  E: "bg-warning/10 text-warning ring-warning/25",
  F: "bg-danger/10 text-danger ring-danger/25",
};

/** Rounded letter-grade tile, tinted by performance band. */
export function GradeBadge({ letter, size = "md" }: { letter: string; size?: "sm" | "md" | "lg" }) {
  const upper = letter.toUpperCase();
  const tone = LETTER_TONE[upper] ?? "bg-muted text-muted-foreground ring-border";
  const dims =
    size === "sm" ? "h-7 w-7 text-xs rounded-lg" : size === "lg" ? "h-16 w-16 text-3xl rounded-2xl" : "h-9 w-9 text-sm rounded-xl";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-bold ring-1",
        tone,
        dims,
      )}
      aria-label={`Letter grade ${upper || "not graded"}`}
    >
      {upper || "—"}
    </span>
  );
}

export function percentageBadgeVariant(pct: number) {
  if (pct >= 80) return "success" as const;
  if (pct >= 60) return "primary" as const;
  if (pct >= 50) return "warning" as const;
  return "danger" as const;
}
