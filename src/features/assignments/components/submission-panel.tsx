"use client";
import { useState, useRef, useEffect } from "react";
import { FileText, Download, CheckCircle2, Clock, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader, type UploadedFile } from "@/components/ui/file-uploader";
import { downloadFile } from "@/features/files/api/files.api";
import { formatDateTime } from "@/lib/utils/format";
import { useSubmitAssignment } from "../hooks/useAssignments";
import type { AssignmentDetail, MySubmission } from "../types/assignment.types";

interface Props {
  assignment: AssignmentDetail;
  submission: MySubmission | null;
}

export function SubmissionPanel({ assignment, submission }: Props) {
  const submitMutation = useSubmitAssignment(assignment.id);
  const [text, setText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const filesRef = useRef(uploadedFiles);

  useEffect(() => {
    filesRef.current = uploadedFiles;
  }, [uploadedFiles]);

  if (submission) {
    const graded = submission.status === "GRADED" || submission.status === "RETURNED";
    const files = submission.files ?? [];
    const feedbackEntries = submission.feedbackEntries ?? [];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={graded ? "success" : submission.isLate ? "warning" : "info"}>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {submission.status}
            </Badge>
            {submission.submittedAt && (
              <span className="text-muted-foreground text-xs">
                Submitted {formatDateTime(submission.submittedAt)}
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              · Attempt {submission.attemptNumber}
            </span>
            {submission.isLate && <Badge variant="danger">Late</Badge>}
          </div>

          {graded && submission.score != null && (
            <div className="border-success/30 bg-success/5 rounded-md border p-3">
              <p className="text-success text-xs font-semibold uppercase">Grade</p>
              <p className="mt-1 text-lg font-semibold">
                {submission.score}
                <span className="text-muted-foreground text-sm">
                  {" "}
                  / {assignment.maxScore}
                </span>
              </p>
            </div>
          )}

          {submission.textContent && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Text
              </p>
              <div className="border-border bg-surface rounded-md border p-3 whitespace-pre-line">
                {submission.textContent}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Files
              </p>
              <ul className="space-y-1">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="border-border flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-xs">Attachment</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(f.file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {submission.feedback && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Feedback
              </p>
              <p className="whitespace-pre-line">{submission.feedback}</p>
            </div>
          )}

          {feedbackEntries.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Feedback history
              </p>
              <ul className="space-y-2">
                {feedbackEntries.map((fe) => (
                  <li
                    key={fe.id}
                    className="border-border bg-surface rounded-md border p-3"
                  >
                    <p className="text-muted-foreground text-xs">
                      {fe.author
                        ? `${fe.author.firstName} ${fe.author.lastName}`
                        : "System"}{" "}
                      · {formatDateTime(fe.createdAt)}
                    </p>
                    <p className="mt-1 whitespace-pre-line">{fe.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  // No submission yet — show form (or closed state)
  const now = new Date();
  const dueDate = new Date(assignment.dueAt);
  const pastDue = now > dueDate;
  const closed = pastDue && !assignment.allowLateSubmission;

  if (closed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission closed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-danger/30 bg-danger/5 flex items-start gap-2 rounded-md border p-3 text-sm">
            <AlertCircle className="text-danger mt-0.5 h-4 w-4" />
            <p>
              This assignment closed on {formatDateTime(assignment.dueAt)}. Late
              submissions are not accepted.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const wantsText =
    assignment.submissionType === "TEXT_ENTRY" ||
    assignment.submissionType === "FILE_AND_TEXT";
  const wantsFiles =
    assignment.submissionType === "FILE_UPLOAD" ||
    assignment.submissionType === "FILE_AND_TEXT";

  const uploadedIds = uploadedFiles
    .filter((f) => f.status === "done" && f.fileId)
    .map((f) => f.fileId!);
  const uploading = uploadedFiles.some((f) => f.status === "uploading");
  const hasError = uploadedFiles.some((f) => f.status === "error");

  const canSubmit =
    !submitMutation.isPending &&
    !uploading &&
    !hasError &&
    (!wantsText || text.trim().length > 0) &&
    (!wantsFiles || uploadedIds.length > 0);

  const onSubmit = () => {
    const currentIds = filesRef.current
      .filter((f) => f.status === "done" && f.fileId)
      .map((f) => f.fileId!);

    const payload = {
      textContent: wantsText ? text : undefined,
      fileIds: wantsFiles ? currentIds : undefined,
    };

    submitMutation.mutate(payload);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Submit your work</CardTitle>
          {pastDue && (
            <Badge variant="warning">
              <Clock className="mr-1 h-3 w-3" />
              Late submission
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {wantsText && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Your answer</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your submission..."
              rows={6}
            />
          </div>
        )}

        {wantsFiles && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Attachments</label>
            <FileUploader files={uploadedFiles} onChange={setUploadedFiles} />
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            loading={submitMutation.isPending}
            disabled={!canSubmit}
          >
            Submit assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
