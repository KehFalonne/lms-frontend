import { Badge } from "@/components/ui/badge";

/** Color-coded letter grade. */
export function GradeBadge({ letter }: { letter: string }) {
  const upper = letter.toUpperCase();
  const variant =
    upper === "A"
      ? "success"
      : upper === "B"
        ? "info"
        : upper === "C"
          ? "primary"
          : upper === "D"
            ? "warning"
            : upper === "E"
              ? "warning"
              : upper === "F"
                ? "danger"
                : "default";

  return <Badge variant={variant}>{upper || "—"}</Badge>;
}

export function percentageBadgeVariant(pct: number) {
  if (pct >= 80) return "success" as const;
  if (pct >= 60) return "primary" as const;
  if (pct >= 50) return "warning" as const;
  return "danger" as const;
}
