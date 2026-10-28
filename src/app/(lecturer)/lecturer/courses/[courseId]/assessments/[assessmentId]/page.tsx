"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileQuestion, Plus, Send, KeyRound } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentQuestionsList } from "@/features/assessments/components/assessment-questions-list";
import { QuestionEditorDialog } from "@/features/assessments/components/question-editor-dialog";
import { QuestionPickerDialog } from "@/features/assessments/components/question-picker-dialog";
import {
  useAssessment,
  useAssessmentQuestions,
  usePublishAssessment,
  useQuestionBanks,
  useGenerateCode,
  useUpdateAssessment,
} from "@/features/assessments/hooks/useAssessments";
import { LECTURER_ROLES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/format";
import { Input } from "@/components/ui/input";

export default function LecturerAssessmentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <DetailContent params={params} />
    </AuthGate>
  );
}

function DetailContent({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  const { courseId, assessmentId } = use(params);
  const router = useRouter();
  const assessmentQ = useAssessment(assessmentId);
  const questionsQ = useAssessmentQuestions(assessmentId);
  const banksQ = useQuestionBanks();
  const publish = usePublishAssessment(courseId);
  const generateCode = useGenerateCode(assessmentId);
  const update = useUpdateAssessment(assessmentId);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const a = assessmentQ.data?.data;
  const questions = questionsQ.data?.data ?? [];
  const banks = banksQ.data?.data ?? [];
  const firstBankId = banks[0]?.id ?? "";

  const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0);

  if (assessmentQ.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!a) {
    return <div className="text-muted-foreground text-sm">Assessment not found.</div>;
  }

  const onPublish = () => {
    publish.mutate(assessmentId, {
      onSuccess: () => {
        setConfirmPublish(false);
        router.push(`/lecturer/courses/${courseId}/assessments`);
      },
    });
  };

  return (
    <div>
      <Link
        href={`/lecturer/courses/${courseId}/assessments`}
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to assessments
      </Link>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{a.assessmentType}</Badge>
            <Badge variant={a.status === "PUBLISHED" ? "success" : "default"}>
              {a.status}
            </Badge>
            <Badge>{totalPoints} pts</Badge>
            {a.timeLimitMinutes && (
              <Badge variant="outline">{a.timeLimitMinutes} min</Badge>
            )}
          </div>
          <h1 className="mt-2 text-xl font-semibold">{a.title}</h1>
          {a.description && (
            <p className="text-muted-foreground mt-1 text-sm">{a.description}</p>
          )}
          {a.availableFrom && (
            <p className="text-muted-foreground mt-2 text-xs">
              Opens {formatDateTime(a.availableFrom)}
              {a.availableUntil && ` · Closes ${formatDateTime(a.availableUntil)}`}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {a.status === "DRAFT" && (
              <Button
                onClick={() => setConfirmPublish(true)}
                disabled={questions.length === 0}
              >
                <Send className="mr-1.5 h-4 w-4" />
                Publish assessment
              </Button>
            )}
            {a.status === "DRAFT" && questions.length === 0 && (
              <p className="text-muted-foreground self-center text-xs">
                Add at least one question to publish.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* CA workflow panel */}
      <Card className="mb-6">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">CA Exam Setup</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Code-gated exam flow with late-entry cutoff and server-enforced timing.
              </p>
            </div>
            <Badge variant={a.isCodeGated ? "success" : "default"}>
              {a.isCodeGated ? "Code-gated" : "Open"}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Opens at (earliest entry)
              </label>
              <Input
                type="datetime-local"
                value={toLocalInput(a.caOpensAt)}
                onChange={(e) =>
                  update.mutate({
                    caOpensAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Last entry at (late cutoff)
              </label>
              <Input
                type="datetime-local"
                value={toLocalInput(a.caLastEntryAt)}
                onChange={(e) =>
                  update.mutate({
                    caLastEntryAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Questions to serve per student (optional)
              </label>
              <Input
                type="number"
                min={1}
                placeholder="Leave blank to serve all questions"
                value={a.serveQuestionCount ?? ""}
                onChange={(e) =>
                  update.mutate({
                    serveQuestionCount: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div>
              <label className="flex items-center gap-2 pt-8 text-sm">
                <input
                  type="checkbox"
                  checked={a.randomizeQuestionOrder ?? false}
                  onChange={(e) =>
                    update.mutate({
                      randomizeQuestionOrder: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Randomize question order
              </label>
            </div>
          </div>

          <div className="border-border bg-surface/50 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Access code</p>
                <p className="text-muted-foreground text-xs">
                  {a.hasAccessCode
                    ? "A code is set. Share it with students at the start of the window."
                    : "No code set yet."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateCode.mutate()}
                  loading={generateCode.isPending}
                >
                  {a.hasAccessCode ? "Regenerate" : "Generate code"}
                </Button>
              </div>
            </div>
            {generateCode.data?.data?.code && (
              <div className="border-success/30 bg-success/10 mt-3 rounded-md border p-3">
                <p className="text-success text-xs font-semibold uppercase">
                  New code — copy it now, it won't be shown again
                </p>
                <p className="mt-1 font-mono text-xl tracking-widest">
                  {generateCode.data.data.code}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Questions</h2>
          <p className="text-muted-foreground text-xs">
            {questions.length} question{questions.length === 1 ? "" : "s"} · {totalPoints}{" "}
            total points
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPickerOpen(true)}
            disabled={banks.length === 0}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            From bank
          </Button>
          <Button
            size="sm"
            onClick={() => setEditorOpen(true)}
            disabled={banks.length === 0}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New question
          </Button>
        </div>
      </div>

      {banks.length === 0 && (
        <EmptyState
          icon={FileQuestion}
          title="No question bank"
          description="Create a question bank first to add questions to this assessment."
        />
      )}

      {banks.length > 0 && <AssessmentQuestionsList assessmentId={assessmentId} />}

      <QuestionPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        assessmentId={assessmentId}
      />

      {firstBankId && (
        <QuestionEditorDialog
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          bankId={firstBankId}
        />
      )}

      <Dialog
        open={confirmPublish}
        onClose={() => !publish.isPending && setConfirmPublish(false)}
        title="Publish assessment?"
        description={`Students will be notified and can start taking "${a.title}" as soon as it becomes available.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmPublish(false)}
              disabled={publish.isPending}
            >
              Cancel
            </Button>
            <Button onClick={onPublish} loading={publish.isPending}>
              Publish
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm">
          {questions.length} question(s) · {totalPoints} total points.
        </p>
      </Dialog>
    </div>
  );
}
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
