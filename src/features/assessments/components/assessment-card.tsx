import Link from "next/link";
import { Clock, FileQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import type { MyAssessment } from "../types/assessment.types";

export function AssessmentCard({ assessment }: { assessment: MyAssessment }) {
  const last = assessment.lastAttempt;
  const completed = last?.status === "AUTO_GRADED" || last?.status === "GRADED";
  const pending = last?.status === "MANUAL_GRADING" || last?.status === "SUBMITTED";
  const inProgress = last?.status === "IN_PROGRESS";

  const href = inProgress
    ? `/assessments/${assessment.id}/attempt/${last!.id}`
    : last
      ? `/assessments/${assessment.id}/result/${last.id}`
      : `/assessments/${assessment.id}`;

  return (
    <Link href={href}>
      <Card className="hover:border-primary p-5 transition-all hover:shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="primary">{assessment.courseCode}</Badge>
              <Badge variant="outline">{assessment.assessmentType}</Badge>
              {inProgress && <Badge variant="warning">In progress</Badge>}
              {completed && <Badge variant="success">Completed</Badge>}
              {pending && <Badge variant="info">Pending grade</Badge>}
            </div>
            <h3 className="font-semibold">{assessment.title}</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {assessment.courseTitle}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge>{assessment.totalPoints} pts</Badge>
              {assessment.timeLimitMinutes && (
                <Badge>
                  <Clock className="mr-1 h-3 w-3" />
                  {assessment.timeLimitMinutes} min
                </Badge>
              )}
              <Badge>
                <FileQuestion className="mr-1 h-3 w-3" />
                {assessment.attemptsUsed}/{assessment.maxAttempts} attempts
              </Badge>
            </div>
          </div>

          {last && completed && (
            <div className="shrink-0 text-right">
              <p className="text-muted-foreground text-xs">Score</p>
              <p className="text-lg font-semibold">
                {Number(last.percentage).toFixed(0)}%
              </p>
              <p className="text-muted-foreground text-xs">
                {last.totalScore}/{assessment.totalPoints}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
