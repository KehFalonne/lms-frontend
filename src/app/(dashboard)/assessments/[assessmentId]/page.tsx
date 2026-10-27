"use client";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Clock, FileQuestion } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  useAssessment,
  useStartAttempt,
} from "@/features/assessments/hooks/useAssessments";
import { formatDateTime } from "@/lib/utils/format";

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  return (
    <AuthGate>
      <DetailInner params={params} />
    </AuthGate>
  );
}

function DetailInner({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAssessment(assessmentId);
  const start = useStartAttempt(assessmentId);
  const a = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!a) return <ErrorState title="Assessment not found" />;

  const onStart = () => {
    start.mutate(undefined, {
      onSuccess: (res) => {
        router.push(`/assessments/${assessmentId}/attempt/${res.data.id}`);
      },
    });
  };

  const attemptsRemaining = a.maxAttempts - a.attemptsUsed;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/assessments"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All assessments
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{a.assessmentType}</Badge>
            {a.timeLimitMinutes && (
              <Badge>
                <Clock className="mr-1 h-3 w-3" />
                {a.timeLimitMinutes} min
              </Badge>
            )}
            <Badge>{a.totalPoints} pts</Badge>
            <Badge variant="outline">
              {a.attemptsUsed}/{a.maxAttempts} attempts used
            </Badge>
          </div>

          <h1 className="mt-3 text-2xl font-semibold">{a.title}</h1>
          {a.description && (
            <p className="text-muted-foreground mt-2 text-sm">{a.description}</p>
          )}

          <div className="border-border bg-surface/50 mt-6 grid gap-4 rounded-md border p-4 sm:grid-cols-2">
            <Fact
              label="Available from"
              value={a.availableFrom ? formatDateTime(a.availableFrom) : "—"}
            />
            <Fact
              label="Available until"
              value={a.availableUntil ? formatDateTime(a.availableUntil) : "—"}
            />
            <Fact label="Passing score" value={`${a.passingScore}%`} />
            <Fact label="Attempts remaining" value={String(attemptsRemaining)} />
          </div>

          {a.instructions && (
            <div className="border-border mt-6 border-t pt-4">
              <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Instructions
              </h2>
              <p className="text-sm whitespace-pre-line">{a.instructions}</p>
            </div>
          )}

          <div className="border-warning/30 bg-warning/10 mt-6 flex items-start gap-2 rounded-md border p-3 text-sm">
            <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Once you begin, the timer will start and cannot be paused. Ensure a stable
              internet connection.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={onStart}
              loading={start.isPending}
              disabled={!a.canStart || attemptsRemaining <= 0}
            >
              {attemptsRemaining <= 0
                ? "No attempts remaining"
                : a.canStart
                  ? "Begin assessment"
                  : "Not available"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
