import type { CategoryBreakdown as CategoryData } from "../types/grading.types";
import { cn } from "@/lib/utils/cn";

interface Props {
  categories: CategoryData[];
}

export function CategoryBreakdown({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No grade categories configured.</p>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((c) => {
        const avg = Number(c.average);
        const pct = Number.isFinite(avg) ? Math.max(0, Math.min(100, avg)) : 0;
        const tone =
          pct >= 80 ? "bg-success" : pct >= 60 ? "bg-primary" : pct >= 50 ? "bg-warning" : "bg-danger";
        return (
          <div key={c.category}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <span className="font-semibold">{c.category}</span>
                <span className="text-muted-foreground ml-2 text-xs tabular-nums">
                  ({c.weight}% weight)
                </span>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">
                {avg.toFixed(1)}%
                <span className="text-muted-foreground ml-2 text-xs font-medium">
                  → {Number(c.weighted).toFixed(1)} pts
                </span>
              </span>
            </div>
            <div
              className="bg-muted h-2 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label={`${c.category} score`}
            >
              <div
                className={cn("h-full rounded-full transition-[width] duration-500", tone)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
