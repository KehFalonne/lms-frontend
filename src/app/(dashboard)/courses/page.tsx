"use client";
import { BookOpen } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { CourseCard } from "@/features/courses/components/course-card";
import { useMyCourses } from "@/features/courses/hooks/useCourses";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  return (
    <AuthGate>
      <CoursesContent />
    </AuthGate>
  );
}

function CoursesContent() {
  const { data, isLoading, isError, refetch } = useMyCourses();
  const enrollments = data?.data ?? [];

  return (
    <div>
      <PageHeader title="My Courses" description="Courses you are enrolled in." />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && enrollments.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Your enrolled courses will appear here once registration is complete."
        />
      )}

      {!isLoading && !isError && enrollments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <CourseCard key={e.id} offering={e.courseOffering} />
          ))}
        </div>
      )}
    </div>
  );
}
