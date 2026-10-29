"use client";
import { use } from "react";
import Link from "next/link";
import { ChevronRight, FileQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentFormDialog } from "@/features/assessments/components/assessment-form-dialog";
import { useCourseAssessments } from "@/features/assessments/hooks/useAssessments";
import { formatDateTime } from "@/lib/utils/format";

export default function LecturerAssessmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading, isError, error, refetch } = useCourseAssessments(courseId);
  const items = data?.data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assessments</h2>
        <AssessmentFormDialog offeringId={courseId} />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load assessments"
          description={
            (error as Error)?.message ??
            "The server rejected the request. Check the backend log and try again."
          }
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={FileQuestion}
          title="No assessments yet"
          description="Create your first quiz or exam."
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="space-y-2">
          {items.map((a) => (
            <Link
              key={a.id}
              href={`/lecturer/courses/${courseId}/assessments/${a.id}`}
              className="block"
            >
              <Card className="hover:border-primary p-4 transition-colors hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{a.assessmentType}</Badge>
                      <Badge variant={a.status === "PUBLISHED" ? "success" : "default"}>
                        {a.status}
                      </Badge>
                      <Badge>{a.totalPoints} pts</Badge>
                      {a.isCodeGated && (
                        <Badge variant="warning">CA · Code required</Badge>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-medium">{a.title}</h3>
                    {a.availableFrom && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Opens {formatDateTime(a.availableFrom)}
                        {a.availableUntil &&
                          ` · Closes ${formatDateTime(a.availableUntil)}`}
                      </p>
                    )}
                    {a.status === "DRAFT" && (
                      <p className="text-warning mt-2 text-xs">
                        Draft — add questions to publish
                      </p>
                    )}
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
