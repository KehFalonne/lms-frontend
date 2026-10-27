import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { dueLabel } from "@/lib/utils/format";
import type { MyAssignment } from "../types/assignment.types";

export function AssignmentCard({ assignment }: { assignment: MyAssignment }) {
  const due = dueLabel(assignment.dueAt);
  const submitted = assignment.mySubmission;
  const graded = submitted?.status === "GRADED" || submitted?.status === "RETURNED";

  return (
    <Link href={`/assignments/${assignment.id}`}>
      <Card className="hover:border-primary p-5 transition-all hover:shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="primary">{assignment.courseCode}</Badge>
              {submitted && (
                <Badge
                  variant={graded ? "success" : submitted.isLate ? "warning" : "info"}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {graded ? "Graded" : submitted.isLate ? "Late" : "Submitted"}
                </Badge>
              )}
              {!submitted && due.variant === "danger" && (
                <Badge variant="danger">
                  <Clock className="mr-1 h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </div>
            <h3 className="font-semibold">{assignment.title}</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {assignment.courseTitle}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={due.variant}>{due.label}</Badge>
              <Badge>{assignment.maxScore} pts</Badge>
            </div>
          </div>
          {graded && submitted?.score != null && (
            <div className="shrink-0 text-right">
              <p className="text-muted-foreground text-xs">Score</p>
              <p className="text-lg font-semibold">
                {submitted.score}
                <span className="text-muted-foreground text-sm">
                  /{assignment.maxScore}
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
