"use client";
import { use } from "react";
import { ClipboardList } from "lucide-react";

import { AssignmentCard } from "@/features/assignments/components/assignment-card";
import { useMyAssignments } from "@/features/assignments/hooks/useAssignments";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export default function CourseAssignmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading } = useMyAssignments();
  const assignments = (data?.data ?? []).filter((a) => a.courseOfferingId === courseId);

  const pending = assignments.filter((a) => !a.mySubmission).length;
  const submitted = assignments.filter((a) => a.mySubmission).length;
  const graded = assignments.filter(
    (a) => a.mySubmission && (a.mySubmission.status === "GRADED" || a.mySubmission.status === "RETURNED"),
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No assignments yet"
        description="Assignments for this course will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        <SummaryChip label="Pending" value={pending} tone="warning" />
        <SummaryChip label="Submitted" value={submitted} tone="info" />
        <SummaryChip label="Graded" value={graded} tone="success" />
      </div>

      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} />
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
  tone: "warning" | "info" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1",
        tone === "warning" && "bg-warning/10 text-warning ring-warning/25",
        tone === "info" && "bg-info/10 text-info ring-info/20",
        tone === "success" && "bg-success/10 text-success ring-success/20",
      )}
    >
      {label}
      <span className="tabular-nums opacity-80">{value}</span>
    </span>
  );
}
