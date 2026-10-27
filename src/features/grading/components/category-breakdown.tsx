import { Progress } from "@/components/ui/progress";
import type { CategoryBreakdown as CategoryData } from "../types/grading.types";

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
        return (
          <div key={c.category}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{c.category}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  ({c.weight}% weight)
                </span>
              </div>
              <span className="font-medium">
                {avg.toFixed(1)}%
                <span className="text-muted-foreground ml-2 text-xs">
                  → {Number(c.weighted).toFixed(1)} pts
                </span>
              </span>
            </div>
            <Progress value={avg} />
          </div>
        );
      })}
    </div>
  );
}
