"use client";
import { use } from "react";
import { GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CategoryBreakdown } from "@/features/grading/components/category-breakdown";
import { GradeBadge } from "@/features/grading/components/grade-badge";
import { GradeItemsTable } from "@/features/grading/components/grade-items-table";
import { useMyCourseGrades } from "@/features/grading/hooks/useGrades";

export default function CourseGradesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading, isError, refetch } = useMyCourseGrades(courseId);
  const detail = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (!detail) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No grades yet"
        description="Published grades will appear here as your lecturers release them."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Final grade summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-muted-foreground text-sm">Final grade</p>
            <p className="mt-1 text-3xl font-semibold">
              {Number(detail.final.percentage).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Letter</p>
            <div className="mt-1 scale-150">
              <GradeBadge letter={detail.final.letterGrade} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBreakdown categories={detail.final.categories} />
        </CardContent>
      </Card>

      {/* Individual items */}
      <Card>
        <CardHeader>
          <CardTitle>Published grades</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeItemsTable items={detail.items} />
        </CardContent>
      </Card>
    </div>
  );
}
