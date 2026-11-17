"use client";
import { Suspense, use } from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion, Layers, UserCog } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCourseOffering } from "@/features/courses/hooks/useOfferings";

export default function AdminCourseAssessmentsLayout({
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
  const { data } = useCourseOffering(courseId);
  const offering = data?.data;

  return (
    <div className="min-w-0">
      <Link
        href="/admin/courses/assessments"
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 mb-4 -ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All course assessments
      </Link>

      {offering ? (
        <div className="border-primary/20 bg-primary/5 mb-4 rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.18em] uppercase ring-1 ring-primary/15">
              {offering.course.code}
            </span>
            <span className="bg-muted/60 text-muted-foreground rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] uppercase">
              {offering.status}
            </span>
            {offering.semester?.name && (
              <span className="bg-muted/60 text-muted-foreground rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] uppercase">
                {offering.semester.name}
              </span>
            )}
            <span className="bg-muted/60 text-muted-foreground rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] uppercase">
              Section {offering.section}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold break-words">
                {offering.course.title}
              </h1>
              <p className="text-muted-foreground text-xs">{offering.programme.name}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <FileQuestion className="text-primary h-4 w-4" aria-hidden />
              Assessments
            </div>
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" aria-hidden />
              {offering.course.credits} credits
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserCog className="h-3.5 w-3.5" aria-hidden />
              {offering.instructorCount}{" "}
              {offering.instructorCount === 1 ? "instructor" : "instructors"}
            </span>
          </div>
        </div>
      ) : (
        <Skeleton className="mb-4 h-24 w-full rounded-xl" />
      )}

      <div className="mt-5">{children}</div>
    </div>
  );
}

function LayoutSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
