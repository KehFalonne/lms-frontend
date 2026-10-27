"use client";
import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadFile } from "@/features/files/api/files.api";
import { formatDateTime } from "@/lib/utils/format";
import { useGradeSubmission } from "../hooks/useAssignments";
import type { SubmissionListItem } from "../api/assignments.api";
import type { AssignmentDetail } from "../types/assignment.types";

interface Props {
  open: boolean;
  onClose: () => void;
  assignmentId: string;
  assignment: AssignmentDetail | null;
  submission: SubmissionListItem | null;
}

export function SubmissionReviewDialog({
  open,
  onClose,
  assignmentId,
  assignment,
  submission,
}: Props) {
  const grade = useGradeSubmission(assignmentId);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (submission) {
      setScore(submission.score ?? "");
      setFeedback(submission.feedback ?? "");
    }
  }, [submission]);

  if (!submission || !assignment) return null;

  const canSubmit =
    score.trim() !== "" &&
    !Number.isNaN(Number(score)) &&
    Number(score) >= 0 &&
    Number(score) <= Number(assignment.maxScore);

  const onSave = () => {
    if (!canSubmit) return;
    grade.mutate(
      {
        submissionId: submission.id,
        payload: { score, feedback },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={() => !grade.isPending && onClose()}
      title={`Grade — ${submission.student.firstName} ${submission.student.lastName}`}
      description={`Attempt ${submission.attemptNumber} · ${submission.student.universityId}`}
      size="lg"
      locked={grade.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={grade.isPending}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={grade.isPending} disabled={!canSubmit}>
            Save grade
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={submission.isLate ? "warning" : "info"}>
            {submission.status}
          </Badge>
          {submission.isLate && <Badge variant="danger">Late</Badge>}
          {submission.submittedAt && (
            <span className="text-muted-foreground text-xs">
              Submitted {formatDateTime(submission.submittedAt)}
            </span>
          )}
        </div>

        {submission.textContent && (
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
              Submission
            </p>
            <div className="border-border bg-surface max-h-48 overflow-y-auto rounded-md border p-3 text-sm whitespace-pre-line">
              {submission.textContent}
            </div>
          </div>
        )}

        {submission.files.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
              Attachments
            </p>
            <ul className="space-y-1">
              {submission.files.map((f) => (
                <li
                  key={f.id}
                  className="border-border flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="text-muted-foreground h-4 w-4" />
                    <span className="text-xs">File attachment</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => downloadFile(f.file)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Score (out of {assignment.maxScore})
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={assignment.maxScore}
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Feedback</label>
          <Textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Comments for the student"
          />
        </div>
      </div>
    </Dialog>
  );
}
