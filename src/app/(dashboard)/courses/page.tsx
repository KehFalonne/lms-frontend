"use client";
import Link from "next/link";
import { BookOpen, GraduationCap, Layers, Plus } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { CourseCard } from "@/features/courses/components/course-card";
import { useMyCourses } from "@/features/courses/hooks/useCourses";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

  const credits = enrollments.reduce(
    (sum, e) => sum + Number(e.courseOffering.course.credits || 0),
    0
  );
  const current = enrollments.find((e) => e.courseOffering.semester.isCurrent);
  const semester = (current ?? enrollments[0])?.courseOffering.semester.name;

  return (
    <div>
      {/* Library header */}
      <header className="mb-6 sm:mb-7">
        <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
          <span aria-hidden className="bg-primary/50 h-px w-6" />
          My enrolment
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My Courses
            </h1>
            <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
              Everything you&apos;re taking this semester — materials, assessments and
              progress, all in one place.
            </p>
          </div>
          {!isLoading && enrollments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
                <BookOpen className="text-primary h-3.5 w-3.5" aria-hidden />
                {enrollments.length} {enrollments.length === 1 ? "course" : "courses"}
              </span>
              <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tabular-nums">
                <Layers className="text-info h-3.5 w-3.5" aria-hidden />
                {credits} credits
              </span>
              <Link href="/course-registration">
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                  <Plus className="h-3 w-3" />
                  Register More
                </Button>
              </Link>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="ring-primary/10 flex h-52 flex-col rounded-2xl border border-white/60 bg-white/85 p-5 ring-1 backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/75"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-4 w-4/5" />
              <Skeleton className="mt-2 h-4 w-3/5" />
              <Skeleton className="mt-auto h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {/* Empty */}
      {!isLoading && !isError && enrollments.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="You haven't been enrolled in any courses this semester. Use Course Registration to browse and request enrollment."
          action={
            <Link href="/course-registration">
              <Button size="sm" className="gap-1.5 text-xs">
                <GraduationCap className="h-3.5 w-3.5" />
                Browse &amp; Register Courses
              </Button>
            </Link>
          }
        />
      )}

      {/* Grid */}
      {!isLoading && !isError && enrollments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {enrollments.map((e) => (
            <CourseCard key={e.id} offering={e.courseOffering} />
          ))}
        </div>
      )}
    </div>
  );
}
