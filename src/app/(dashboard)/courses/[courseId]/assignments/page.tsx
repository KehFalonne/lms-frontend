"use client";
import { use } from "react";
import { ClipboardList } from "lucide-react";

import { AssignmentCard } from "@/features/assignments/components/assignment-card";
import { useMyAssignments } from "@/features/assignments/hooks/useAssignments";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseAssignmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading } = useMyAssignments();
  const assignments = (data?.data ?? []).filter((a) => a.courseOfferingId === courseId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
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
      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} />
      ))}
    </div>
  );
}
