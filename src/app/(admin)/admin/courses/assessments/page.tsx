"use client";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTeachingCourses } from "@/features/lecturer/hooks/useLecturer";
import { ADMIN_ROLES } from "@/lib/constants/routes";

export default function AdminCourseAssessmentsIndexPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <OfferingsContent />
    </AuthGate>
  );
}

function OfferingsContent() {
  const { data, isLoading, isError, error, refetch } = useMyTeachingCourses();
  const offerings = useMemo(() => {
    const raw = data?.data ?? [];
    const seen = new Set<string>();
    return raw.filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [data]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Course Assessments
        </h1>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-6">
          Pick a course offering to create, import and publish its quizzes and CA exams.
        </p>
      </header>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load course offerings"
          description={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && offerings.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No course offerings"
          description="Create course offerings before managing assessments."
        />
      )}

      {!isLoading && !isError && offerings.length > 0 && (
        <div className="space-y-2">
          {offerings.map((o) => (
            <Link
              key={o.id}
              href={`/admin/courses/${o.id}/assessments`}
              className="block"
            >
              <Card className="hover:border-primary p-4 transition-colors hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm">{o.course.code}</strong>
                      <Badge variant={o.status === "ACTIVE" ? "success" : "default"}>
                        {o.status}
                      </Badge>
                      <Badge variant="outline">{o.semester.name}</Badge>
                      <Badge variant="outline">Sec {o.section}</Badge>
                    </div>
                    <h3 className="mt-1.5 font-medium">{o.course.title}</h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {o.programme.name} · {o.assessmentCount} assessment
                      {o.assessmentCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ChevronRight className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
