"use client";
import { Suspense, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    <div>
      <Link
        href="/lecturer/courses"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All courses
      </Link>

      <div className="border-border bg-background mb-5 rounded-lg border p-5">
        {offering ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{offering.course.code}</Badge>
              <Badge>{offering.status}</Badge>
              {offering.semester?.name && (
                <Badge variant="info">{offering.semester.name}</Badge>
              )}
            </div>
            <h1 className="mt-2 text-xl font-semibold">{offering.course.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {offering.programme.name} · Section {offering.section}
            </p>
          </>
        ) : (
          <div className="animate-pulse space-y-2">
            <div className="bg-muted h-4 w-24 rounded" />
            <div className="bg-muted h-6 w-64 rounded" />
            <div className="bg-muted h-4 w-48 rounded" />
          </div>
        )}
      </div>

      <Tabs
        tabs={[
          { label: "Overview", href: base, exact: true },
          { label: "Content", href: `${base}/content` },
          { label: "Content Progress", href: `${base}/content-progress` },
          { label: "Assignments", href: `${base}/assignments` },
          { label: "Assessments", href: `${base}/assessments` },
          { label: "Announcements", href: `${base}/announcements` },
          { label: "Students", href: `${base}/students` },
          { label: "Gradebook", href: `/lecturer/courses/${courseId}/gradebook` },
        ]}
        className="mb-6"
      />

      {children}
    </div>
  );
}

function LayoutSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
