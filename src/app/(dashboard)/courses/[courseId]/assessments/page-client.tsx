"use client";

import { FileQuestion } from "lucide-react";

import { AssessmentCard } from "@/features/assessments/components/assessment-card";
import { useMyAssessments } from "@/features/assessments/hooks/useAssessments";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export default function CourseAssessmentsPageClient({ courseId }: { courseId: string }) {
  const { data, isLoading } = useMyAssessments();
  const assessments = (data?.data ?? []).filter((a) => a.courseOfferingId === courseId);

  const isInProgress = (a: (typeof assessments)[number]) =>
    a.lastAttempt?.status === "IN_PROGRESS";
  const isCompleted = (a: (typeof assessments)[number]) =>
    a.lastAttempt?.status === "AUTO_GRADED" || a.lastAttempt?.status === "GRADED";

  const open = assessments.filter((a) => !isInProgress(a) && !isCompleted(a)).length;
  const inProgress = assessments.filter(isInProgress).length;
  const completed = assessments.filter(isCompleted).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No assessments yet"
        description="Published quizzes and exams for this course will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        <SummaryChip label="Open" value={open} tone="primary" />
        <SummaryChip label="In progress" value={inProgress} tone="warning" />
        <SummaryChip label="Completed" value={completed} tone="success" />
      </div>

      {assessments.map((a) => (
        <AssessmentCard key={a.id} assessment={a} />
      ))}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "warning" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1",
        tone === "primary" && "bg-primary/10 text-primary ring-primary/20",
        tone === "warning" && "bg-warning/10 text-warning ring-warning/25",
        tone === "success" && "bg-success/10 text-success ring-success/20",
      )}
    >
      {label}
      <span className="tabular-nums opacity-80">{value}</span>
    </span>
  );
}
