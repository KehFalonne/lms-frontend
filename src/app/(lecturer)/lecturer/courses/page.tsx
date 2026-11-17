"use client";
import { BookOpen, ClipboardList, Users } from "lucide-react";
import { useMemo } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TeachingCourseCard } from "@/features/lecturer/components/teaching-course-card";
import { useMyTeachingCourses } from "@/features/lecturer/hooks/useLecturer";
import { LECTURER_ROLES } from "@/lib/constants/routes";

export default function LecturerCoursesPage() {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <CoursesContent />
    </AuthGate>
  );
}

function CoursesContent() {
  const { data, isLoading, isError, refetch } = useMyTeachingCourses();
  const courses = useMemo(() => {
    const raw = data?.data ?? [];
    const seen = new Set<string>();
    return raw.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [data]);

  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
  const pendingGrading = courses.reduce((sum, c) => sum + c.pendingSubmissions, 0);
  const semester = courses[0]?.semester.name;

  return (
    <div>
      {/* Teaching load header */}
      <header className="mb-6 sm:mb-7">
        <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
          <span aria-hidden className="bg-primary/50 h-px w-6" />
          My teaching load
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My Courses
            </h1>
            <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
              Everything you&apos;re teaching this semester — content, assessments and
              grading, all in one place.
            </p>
          </div>
          {!isLoading && courses.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
                <BookOpen className="text-primary h-3.5 w-3.5" aria-hidden />
                {courses.length} {courses.length === 1 ? "course" : "courses"}
              </span>
              <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
                <Users className="text-info h-3.5 w-3.5" aria-hidden />
                {totalStudents} students
              </span>
              <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
                <ClipboardList
                  className={pendingGrading > 0 ? "text-warning h-3.5 w-3.5" : "h-3.5 w-3.5"}
                  aria-hidden
                />
                {pendingGrading} pending
              </span>
            </div>
          )}
        </div>
        {semester && (
          <p className="text-muted-foreground/80 mt-3 text-[10px] font-semibold tracking-[0.2em] uppercase">
            {semester}
          </p>
        )}
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="ring-primary/10 flex h-72 flex-col rounded-2xl border border-white/60 bg-white/85 p-5 ring-1 backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/75"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-4 w-4/5" />
              <Skeleton className="mt-2 h-4 w-3/5" />
              <Skeleton className="mt-4 h-20 w-full rounded-xl" />
              <Skeleton className="mt-auto h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {/* Empty */}
      {!isLoading && !isError && courses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="You haven't been assigned to teach any courses."
        />
      )}

      {/* Grid */}
      {!isLoading && !isError && courses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {courses.map((c) => (
            <TeachingCourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
