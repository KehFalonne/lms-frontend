"use client";
import { useState } from "react";
import { Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { percentageBadgeVariant } from "./grade-badge";
import { AppealDialog } from "./appeal-dialog";
import type { PublishedGradeItem } from "../types/grading.types";

interface Props {
  items: PublishedGradeItem[];
}

export function GradeItemsTable({ items }: Props) {
  const [appealItem, setAppealItem] = useState<PublishedGradeItem | null>(null);

  return (
    <>
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
            cell: (g) => (
              <span className="text-muted-foreground">{g.category ?? "—"}</span>
            ),
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
          {
            key: "actions",
            header: "",
            align: "right",
            cell: (g) =>
              g.score != null ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAppealItem(g)}
                  aria-label="Appeal this grade"
                >
                  <Flag className="mr-1 h-3.5 w-3.5" />
                  Appeal
                </Button>
              ) : null,
          },
        ]}
      />

      {appealItem && (
        <AppealDialog
          open={!!appealItem}
          onClose={() => setAppealItem(null)}
          // gradeId={appealItem.gradeItemId}
          gradeId={appealItem.gradeId}
          gradeItemName={appealItem.name}
          currentScore={appealItem.score}
          maxScore={appealItem.maxScore}
        />
      )}
    </>
  );
}
