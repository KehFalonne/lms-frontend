"use client";
import { use } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Hourglass } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useAttemptResult } from "@/features/assessments/hooks/useAssessments";
import { formatDateTime } from "@/lib/utils/format";

export default function AttemptResultPage({
  params,
}: {
  params: Promise<{ assessmentId: string; attemptId: string }>;
}) {
  return (
    <AuthGate>
      <ResultInner params={params} />
    </AuthGate>
  );
}

function ResultInner({
  params,
}: {
  params: Promise<{ assessmentId: string; attemptId: string }>;
}) {
  const { assessmentId, attemptId } = use(params);
  const { data, isLoading, isError, refetch } = useAttemptResult(attemptId);
  const r = data?.data;

  if (isLoading) return <Skeleton className="mx-auto h-64 max-w-md" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!r) return <ErrorState title="Result not found" />;

  const pending = r.status === "SUBMITTED" || r.status === "MANUAL_GRADING";
  const completed = r.status === "AUTO_GRADED" || r.status === "GRADED";
  const expired = r.status === "EXPIRED";

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="bg-success/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            {pending ? (
              <Hourglass className="text-warning h-7 w-7" />
            ) : (
              <CheckCircle2 className="text-success h-7 w-7" />
            )}
          </div>
          <h1 className="text-xl font-semibold">
            {pending ? "Submitted" : "Attempt complete"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge variant={completed ? "success" : pending ? "warning" : "default"}>
              {r.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline">Attempt {r.attemptNumber}</Badge>
            {expired && (
              <Badge variant="danger">
                <Clock className="mr-1 h-3 w-3" /> Expired
              </Badge>
            )}
          </div>

          {completed ? (
            <>
              <p className="mt-6 text-4xl font-semibold">
                {Number(r.percentage).toFixed(1)}%
              </p>
              <p className="text-muted-foreground mt-1 text-sm">Score: {r.totalScore}</p>
            </>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">
              Some questions require manual grading. Your final score will be available
              once grading is complete.
            </p>
          )}

          {r.submittedAt && (
            <p className="text-muted-foreground mt-3 text-xs">
              Submitted {formatDateTime(r.submittedAt)}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-2">
            <Link href={`/assessments/${assessmentId}`}>
              <Button variant="outline" className="w-full">
                Back to assessment
              </Button>
            </Link>
            <Link href="/assessments">
              <Button variant="ghost" className="w-full">
                All assessments
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
