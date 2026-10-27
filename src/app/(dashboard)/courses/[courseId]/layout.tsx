"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCourse } from "@/features/courses/hooks/useCourses";

export default function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  return (
    <AuthGate>
      <CourseLayoutInner params={params}>{children}</CourseLayoutInner>
    </AuthGate>
  );
}

function CourseLayoutInner({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data } = useCourse(courseId);
  const offering = data?.data;
  const base = `/courses/${courseId}`;

  return (
    <div>
      <Link
        href="/courses"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All courses
      </Link>

      {/* ── Header shell — always renders ── */}
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
          /* Minimal skeleton inside the shell — no early return */
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
          { label: "Assignments", href: `${base}/assignments` },
          { label: "Assessments", href: `${base}/assessments` },
          { label: "Grades", href: `${base}/grades` },
          { label: "Announcements", href: `${base}/announcements` },
          { label: "Discussions", href: `${base}/discussions` },
        ]}
        className="mb-6"
      />

      {/* ── Always render children — this is what was dropped ── */}
      {children}
    </div>
  );
}
