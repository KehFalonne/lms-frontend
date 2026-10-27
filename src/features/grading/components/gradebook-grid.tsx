"use client";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { useGradebook, usePublishGradeItem, useSetGrade } from "../hooks/useGrades";
import type { GradebookCell } from "../types/grading.types";

interface Props {
  offeringId: string;
}

export function GradebookGrid({ offeringId }: Props) {
  const { data, isLoading } = useGradebook(offeringId);
  const setGrade = useSetGrade(offeringId);
  const publishItem = usePublishGradeItem(offeringId);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!data?.data) return null;

  const { items, students } = data.data;

  if (students.length === 0 || items.length === 0) {
    return (
      <div className="border-border rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {items.length === 0
            ? "No grade items configured yet."
            : "No enrolled students yet."}
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-border bg-surface/60 border-b">
          <tr>
            <th className="bg-surface/60 text-muted-foreground sticky left-0 z-10 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
              Student
            </th>
            {items.map((item) => (
              <th
                key={item.id}
                className="text-muted-foreground min-w-[120px] px-2 py-3 text-center text-xs font-medium"
              >
                <div className="truncate">{item.name}</div>
                <div className="text-[10px] normal-case">
                  /{Number(item.maxScore).toFixed(0)}
                </div>
                {!item.isPublished && (
                  <button
                    className="text-warning mt-1 text-[10px] uppercase hover:underline"
                    onClick={() => publishItem.mutate(item.id)}
                  >
                    Publish
                  </button>
                )}
                {item.isPublished && (
                  <span className="text-success mt-1 inline-block text-[10px] uppercase">
                    Live
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {students.map((s) => (
            <tr key={s.studentId}>
              <td className="bg-background sticky left-0 z-10 px-4 py-3">
                <p className="font-medium">{s.studentName}</p>
                <p className="text-muted-foreground text-xs">{s.studentNumber}</p>
              </td>
              {items.map((item) => {
                const cell = s.grades[item.id];
                return (
                  <td key={item.id} className="px-2 py-2 text-center">
                    <GradeCell
                      cell={cell}
                      maxScore={Number(item.maxScore)}
                      onSave={(score) =>
                        setGrade.mutate({
                          gradeItemId: item.id,
                          studentId: s.studentId,
                          score,
                        })
                      }
                      saving={
                        setGrade.isPending &&
                        setGrade.variables?.gradeItemId === item.id &&
                        setGrade.variables?.studentId === s.studentId
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function GradeCell({
  cell,
  maxScore,
  onSave,
  saving,
}: {
  cell: GradebookCell;
  maxScore: number;
  onSave: (score: string | null) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(cell.score ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(cell.score ?? "");
  }, [cell.score]);

  const commit = () => {
    setEditing(false);
    const trimmed = value.trim();
    const next = trimmed === "" ? null : trimmed;
    if (next === (cell.score ?? null) || (next === null && !cell.score)) {
      return;
    }
    onSave(next);
  };

  if (!editing) {
    return (
      <button
        onClick={() => {
          setEditing(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          "hover:bg-surface flex h-9 w-full items-center justify-center rounded text-sm transition-colors",
          cell.score != null && "font-medium",
          cell.status === "PUBLISHED" && "text-success",
          cell.status === "DRAFT" && "text-foreground",
          cell.score == null && "text-muted-foreground"
        )}
      >
        {saving ? (
          <span className="text-xs">Saving...</span>
        ) : cell.score != null ? (
          cell.score
        ) : (
          "—"
        )}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      type="number"
      step="0.01"
      min={0}
      max={maxScore}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") {
          setValue(cell.score ?? "");
          setEditing(false);
        }
      }}
      className="h-9 w-full text-center text-sm"
    />
  );
}
