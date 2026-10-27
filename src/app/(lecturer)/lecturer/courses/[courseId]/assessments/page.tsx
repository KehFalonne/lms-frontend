"use client";
import { use } from "react";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
  const { data, isLoading } = useCourseAssessments(courseId);
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

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={FileQuestion}
          title="No assessments yet"
          description="Create your first quiz or exam."
        />
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((a) => (
            <Link
              key={a.id}
              href={`/lecturer/courses/${courseId}/assessments/${a.id}`}
              className="block"
            >
              <Card className="hover:border-primary p-4 transition-colors hover:shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">{a.assessmentType}</Badge>
                  <Badge variant={a.status === "PUBLISHED" ? "success" : "default"}>
                    {a.status}
                  </Badge>
                  <Badge>{a.totalPoints} pts</Badge>
                </div>
                <h3 className="mt-1.5 font-medium">{a.title}</h3>
                {a.availableFrom && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Opens {formatDateTime(a.availableFrom)}
                    {a.availableUntil && ` · Closes ${formatDateTime(a.availableUntil)}`}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
