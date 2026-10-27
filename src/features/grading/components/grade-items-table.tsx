import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { percentageBadgeVariant } from "./grade-badge";
import type { PublishedGradeItem } from "../types/grading.types";

interface Props {
  items: PublishedGradeItem[];
}

export function GradeItemsTable({ items }: Props) {
  return (
    <ResponsiveTable
      rows={items}
      keyExtractor={(row) => row.gradeItemId}
      emptyMessage="No published grades yet. Grades appear here once your lecturer publishes them."
      columns={[
        {
          key: "item",
          header: "Item",
          cell: (g) => (
            <div>
              <p className="font-medium">{g.name}</p>
              {g.feedback && (
                <p className="text-muted-foreground mt-0.5 text-xs">{g.feedback}</p>
              )}
            </div>
          ),
        },
        {
          key: "category",
          header: "Category",
          cell: (g) => <span className="text-muted-foreground">{g.category ?? "—"}</span>,
        },
        {
          key: "score",
          header: "Score",
          align: "right",
          cell: (g) => (g.score != null ? `${g.score} / ${g.maxScore}` : "—"),
        },
        {
          key: "percentage",
          header: "%",
          align: "right",
          cell: (g) => {
            const pct = g.percentage != null ? Number(g.percentage) : null;
            return pct != null ? (
              <Badge variant={percentageBadgeVariant(pct)}>{pct.toFixed(1)}%</Badge>
            ) : (
              "—"
            );
          },
        },
      ]}
    />
  );
}
