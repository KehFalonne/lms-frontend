"use client";

import { FileQuestion } from "lucide-react";

import { AssessmentCard } from "@/features/assessments/components/assessment-card";
import { useMyAssessments } from "@/features/assessments/hooks/useAssessments";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseAssessmentsPageClient({ courseId }: { courseId: string }) {
  const { data, isLoading } = useMyAssessments();
  const assessments = (data?.data ?? []).filter((a) => a.courseOfferingId === courseId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
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
      {assessments.map((a) => (
        <AssessmentCard key={a.id} assessment={a} />
      ))}
    </div>
  );
}
