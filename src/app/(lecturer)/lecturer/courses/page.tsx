"use client";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTeachingCourses } from "@/features/lecturer/hooks/useLecturer";
import { LECTURER_ROLES } from "@/lib/constants/routes";
import { useMemo } from "react";

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

  return (
    <div>
      <PageHeader title="My Courses" description="Courses you teach." />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && courses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="You haven't been assigned to teach any courses."
        />
      )}

      {!isLoading && !isError && courses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <Link key={c.id} href={`/lecturer/courses/${c.id}`}>
              <Card className="hover:border-primary h-full p-5 transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="primary">{c.course.code}</Badge>
                  <Badge variant={c.status === "ACTIVE" ? "success" : "default"}>
                    {c.status}
                  </Badge>
                </div>

                <h3 className="mt-2 font-semibold">{c.course.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  {c.semester.name} · Section {c.section}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Stat label="Students" value={c.studentCount} />
                  <Stat
                    label="Pending"
                    value={c.pendingSubmissions}
                    accent={c.pendingSubmissions > 0}
                  />
                  <Stat
                    label="Activities"
                    value={c.assignmentCount + c.assessmentCount}
                  />
                </div>

                <div className="text-primary mt-3 flex items-center justify-end text-sm">
                  Manage
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div>
      <p className={`text-lg font-semibold ${accent ? "text-warning" : ""}`}>{value}</p>
      <p className="text-muted-foreground text-[10px] tracking-wide uppercase">{label}</p>
    </div>
  );
}
