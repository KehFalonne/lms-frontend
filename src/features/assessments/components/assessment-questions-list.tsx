"use client";
import { ArrowDown, ArrowUp, Check, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAssessmentQuestions,
  useDetachQuestion,
  useUpdateAssessmentQuestion,
} from "../hooks/useAssessments";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  assessmentId: string;
}

export function AssessmentQuestionsList({ assessmentId }: Props) {
  const { data, isLoading } = useAssessmentQuestions(assessmentId);
  const update = useUpdateAssessmentQuestion(assessmentId);
  const detach = useDetachQuestion(assessmentId);

  const rows = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="border-border rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No questions yet. Add questions from a bank or create new ones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row, idx) => (
        <Card key={row.id} className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="text-muted-foreground font-mono text-xs">{idx + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                disabled={idx === 0 || update.isPending}
                onClick={() =>
                  update.mutate({
                    aqId: row.id,
                    payload: { position: idx }, // swap with prev
                  })
                }
                aria-label="Move up"
                className="h-6 w-6"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={idx === rows.length - 1 || update.isPending}
                onClick={() =>
                  update.mutate({
                    aqId: row.id,
                    payload: { position: idx + 2 }, // swap with next
                  })
                }
                aria-label="Move down"
                className="h-6 w-6"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="primary">
                  {row.question.questionType.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm">{row.question.text}</p>

              {row.question.options.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {row.question.options.map((o) => (
                    <li key={o.id} className="flex items-center gap-2 text-sm">
                      {o.isCorrect ? (
                        <Check className="text-success h-3.5 w-3.5" />
                      ) : (
                        <span className="h-3.5 w-3.5" />
                      )}
                      <span
                        className={o.isCorrect ? "font-medium" : "text-muted-foreground"}
                      >
                        {o.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <label className="text-muted-foreground text-xs">Points</label>
                <Input
                  type="number"
                  step="0.5"
                  defaultValue={row.points}
                  min={0}
                  className="h-8 w-20 text-sm"
                  onBlur={(e) => {
                    const v = e.target.value;
                    if (v && Number(v) >= 0 && v !== row.points) {
                      update.mutate({
                        aqId: row.id,
                        payload: { points: v },
                      });
                    }
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger"
                onClick={() => detach.mutate(row.id)}
                loading={detach.isPending && detach.variables === row.id}
                disabled={detach.isPending}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
