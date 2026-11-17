"use client";
import { Suspense, use } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Layers, UserCog, Users } from "lucide-react";

import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses/hooks/useCourses";

export default function LecturerCourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LayoutInner params={params}>{children}</LayoutInner>
    </Suspense>
  );
}

function LayoutInner({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data } = useCourse(courseId);
  const offering = data?.data;
  const base = `/lecturer/courses/${courseId}`;

  return (
    <div className="min-w-0">
      {/* Back navigation */}
      <Link
        href="/lecturer/courses"
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 mb-4 -ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All courses
      </Link>

      {/* ── Course hero ───────────────────────────────────────────── */}
      {offering ? (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,hsl(226_58%_15%)_0%,hsl(221_72%_28%)_55%,hsl(215_90%_46%)_125%)] p-5 text-white shadow-[0_30px_70px_-32px_hsl(221_83%_30%/0.65)] sm:p-6">
          {/* decorative arcs */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-14 h-56 w-56 text-white/10"
            viewBox="0 0 240 240"
            fill="none"
          >
            <circle cx="240" cy="0" r="150" stroke="currentColor" strokeWidth="22" />
            <circle
              cx="240"
              cy="0"
              r="84"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            {/* Monogram */}
            <div className="course-code flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-center text-lg font-bold tracking-tight uppercase ring-1 ring-white/15 backdrop-blur-sm sm:h-20 sm:w-20 sm:text-xl">
              {offering.course.code.split(" ")[0]}
            </div>

            <div className="min-w-0 flex-1">
              {/* meta chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="course-code-badge rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold tracking-[0.18em] text-sky-100 uppercase ring-1 ring-white/15">
                  {offering.course.code}
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-sky-200/90 uppercase ring-1 ring-white/10">
                  {offering.status}
                </span>
                {offering.semester?.name && (
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-sky-200/90 uppercase ring-1 ring-white/10">
                    {offering.semester.name}
                  </span>
                )}
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-sky-200/90 uppercase ring-1 ring-white/10">
                  Section {offering.section}
                </span>
              </div>

              <h1 className="mt-3 text-xl leading-snug font-semibold tracking-tight break-words sm:text-2xl">
                {offering.course.title}
              </h1>
              <p className="mt-1.5 line-clamp-1 text-sm text-sky-100/75">
                {offering.programme.name}
              </p>

              {/* facts row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold tracking-[0.16em] text-sky-200/70 uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" aria-hidden />
                  {offering.course.credits} credits
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                  Level {offering.course.level}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserCog className="h-3.5 w-3.5" aria-hidden />
                  {offering.instructorCount}{" "}
                  {offering.instructorCount === 1 ? "instructor" : "instructors"}
                </span>
              </div>
            </div>

            {/* Capacity meter */}
            <div className="w-full shrink-0 sm:w-44">
              <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] text-sky-200/70 uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  Enrolled
                </span>
                <span className="text-sky-100 tabular-nums">
                  {offering.enrolledCount}
                  {offering.capacity > 0 ? `/${offering.capacity}` : ""}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-300 transition-[width] duration-500"
                  style={{
                    width: `${offering.capacity > 0 ? Math.min(100, (offering.enrolledCount / offering.capacity) * 100) : 100}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-[9px] tracking-[0.16em] text-sky-200/50 uppercase">
                {offering.capacity > 0
                  ? `${Math.max(0, offering.capacity - offering.enrolledCount)} seats left`
                  : "Open enrolment"}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <div className="border-border/60 bg-muted/40 h-44 animate-pulse rounded-2xl border sm:h-48" />
      )}

      {/* ── Section tabs ──────────────────────────────────────────── */}
      <Tabs
        className="mt-4"
        tabs={[
          { label: "Overview", href: base, exact: true },
          { label: "Content", href: `${base}/content` },
          { label: "Content Progress", href: `${base}/content-progress` },
          { label: "Assignments", href: `${base}/assignments` },
          { label: "Assessments", href: `${base}/assessments` },
          { label: "Announcements", href: `${base}/announcements` },
          { label: "Students", href: `${base}/students` },
          { label: "Analytics", href: `${base}/analytics` },
          // { label: "Instructors", href: `${base}/instructors` },
          { label: "Gradebook", href: `${base}/gradebook` },
        ]}
      />

      {/* ── Section content ─────────────────────────────────────────── */}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function LayoutSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-44 w-full rounded-2xl sm:h-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
