"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Flag,
  ListChecks,
  MessageSquare,
  X,
} from "lucide-react";
import { useProctoring } from "../hooks/useProctoring";
import { ProctoringBanner } from "./proctoring-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { useLiveAttempt, useSaveAnswer, useSubmitAttempt } from "../hooks/useAssessments";
import { QuestionRenderer, isAnswerEmpty } from "./question-renderer";
import type { AttemptAnswerState, AttemptLive } from "../types/assessment.types";
import { useLockdown } from "../hooks/useLockdown";
import { LockdownGate } from "./lockdown-gate";

type SaveState = "idle" | "saving" | "saved" | "error";

interface LiveAttemptProps {
  attemptId: string;
}

export function LiveAttempt({ attemptId }: LiveAttemptProps) {
  const router = useRouter();
  const { data, isLoading } = useLiveAttempt(attemptId);
  const saveMutation = useSaveAnswer(attemptId);
  const submitMutation = useSubmitAttempt(attemptId);

  const attempt = data?.data as AttemptLive | undefined;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswerState>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [proctoringModal, setProctoringModal] = useState(false);
  const [invigilatorMessage, setInvigilatorMessage] = useState<string | null>(null);
  const lastMessageId = useRef<string | null>(null);

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const initialized = useRef(false);

  const proctoring = useProctoring({
    attemptId,
    enabled:
      !!attempt &&
      attempt.status === "IN_PROGRESS" &&
      attempt.proctoringEnabled &&
      !submitMutation.isPending,
    initialViolations: attempt?.proctoringViolationCount ?? 0,
    enforcement: attempt?.proctoringEnforcement ?? "REVIEW_ONLY",
    onMaxReached: () => {
      setProctoringModal(true);
      // The server has already submitted the attempt. Only navigate after
      // giving the student a short explanation.
      setTimeout(() => {
        if (attempt) {
          router.replace(`/assessments/${attempt.assessmentId}/result/${attempt.id}`);
        }
      }, 2500);
    },
  });

  const [lockdownEntered, setLockdownEntered] = useState(false);

  const lockdown = useLockdown({
    attemptId,
    enabled:
      !!attempt &&
      (attempt.status === "IN_PROGRESS" || attempt.status === "PAUSED") &&
      attempt.proctoringMode === "LOCKDOWN",
    onExitAttempted: () => {
      // useProctoring records the fullscreen event; this callback only opens
      // the recovery gate maintained by useLockdown.
    },
    onServerSubmitted: () => {
      setProctoringModal(true);
      setTimeout(() => {
        if (attempt) {
          router.replace(`/assessments/${attempt.assessmentId}/result/${attempt.id}`);
        }
      }, 2500);
    },
  });

  const requiresLockdown =
    attempt?.proctoringMode === "LOCKDOWN" && attempt?.status === "IN_PROGRESS";

  useEffect(() => {
    if (attempt && !initialized.current) {
      setAnswers(attempt.answers ?? {});
      initialized.current = true;
    }
  }, [attempt]);

  useEffect(() => {
    const message = attempt?.caInvigilatorMessage;
    if (!message || message.id === lastMessageId.current) return;
    lastMessageId.current = message.id;
    setInvigilatorMessage(message.message);
  }, [attempt?.caInvigilatorMessage]);

  useEffect(() => {
    const onMonitoringAction = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          attemptId?: string;
          action?: string;
          message?: string;
        }>
      ).detail;
      if (detail.attemptId !== attemptId) return;
      if (detail.action === "RESET_LOCKDOWN") {
        setLockdownEntered(false);
      }
      if (detail.action === "MESSAGE" && detail.message) {
        setInvigilatorMessage(detail.message);
      }
    };
    window.addEventListener("ca:monitoring", onMonitoringAction);
    return () => window.removeEventListener("ca:monitoring", onMonitoringAction);
  }, [attemptId]);

  useEffect(() => {
    if (!attempt?.expiresAt) return;
    const target = new Date(attempt.expiresAt).getTime();

    const tick = () => {
      const secs = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSecondsLeft(secs);
      if (secs === 0) {
        submitMutation.mutate(undefined, {
          onSuccess: () => {
            router.replace(`/assessments/${attempt.assessmentId}/result/${attempt.id}`);
          },
        });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.expiresAt]);

  useEffect(() => {
    if (attempt && !["IN_PROGRESS", "PAUSED"].includes(attempt.status)) {
      router.replace(`/assessments/${attempt.assessmentId}/result/${attempt.id}`);
    }
  }, [attempt, router]);

  const persist = useCallback(
    async (aqId: string, payload: AttemptAnswerState) => {
      setSaveStates((prev) => ({ ...prev, [aqId]: "saving" }));
      try {
        await saveMutation.mutateAsync({
          aqId,
          payload: {
            answerText: payload.answerText,
            selectedOptionIds: payload.selectedOptionIds,
            numericAnswer:
              payload.numericAnswer === null || payload.numericAnswer === ""
                ? null
                : Number(payload.numericAnswer),
            answerData: payload.answerData,
          },
        });
        setSaveStates((prev) => ({ ...prev, [aqId]: "saved" }));
        setTimeout(() => {
          setSaveStates((prev) =>
            prev[aqId] === "saved" ? { ...prev, [aqId]: "idle" } : prev
          );
        }, 2000);
      } catch {
        setSaveStates((prev) => ({ ...prev, [aqId]: "error" }));
      }
    },
    [saveMutation]
  );

  const updateAnswer = useCallback(
    (aqId: string, next: AttemptAnswerState) => {
      setAnswers((prev) => ({ ...prev, [aqId]: next }));
      clearTimeout(saveTimers.current[aqId]);
      saveTimers.current[aqId] = setTimeout(() => persist(aqId, next), 600);
    },
    [persist]
  );

  const toggleFlag = (aqId: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(aqId)) next.delete(aqId);
      else next.add(aqId);
      return next;
    });
  };

  const answeredCount = useMemo(() => {
    if (!attempt) return 0;
    return attempt.questions.filter((q) => !isAnswerEmpty(answers[q.id])).length;
  }, [attempt, answers]);

  const handleSubmit = () => {
    submitMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace(`/assessments/${attempt!.assessmentId}/result/${attempt!.id}`);
      },
    });
  };

  const goTo = (i: number) => {
    setCurrentIdx(i);
    setNavigatorOpen(false);
  };

  if (isLoading || !attempt) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
          <Clock className="h-6 w-6 animate-pulse" />
          Loading attempt...
        </div>
      </div>
    );
  }

  if (attempt.status === "PAUSED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <Card className="max-w-md p-6">
          <h2 className="text-lg font-semibold">Your CA attempt is paused</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            The invigilator has paused this attempt. Your answers are preserved. You can
            continue when the invigilator resumes the session.
          </p>
        </Card>
      </div>
    );
  }

  if (requiresLockdown && (!lockdownEntered || lockdown.needsRecovery)) {
    return (
      <LockdownGate
        isRecovery={lockdownEntered && lockdown.needsRecovery}
        enterLockdown={async () => {
          const ok = await lockdown.enterLockdown();
          if (ok) setLockdownEntered(true);
          return ok;
        }}
        onEntered={() => setLockdownEntered(true)}
      />
    );
  }

  const q = attempt.questions[currentIdx];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerDanger = secondsLeft < 60 && secondsLeft > 0;
  const currentSaveState = saveStates[q.id] ?? "idle";
  const isLast = currentIdx === attempt.questions.length - 1;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Compact sticky header */}
      <div className="border-border bg-background/95 pt-safe sticky top-0 z-30 -mx-4 -mt-4 border-b px-4 py-2 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{attempt.assessmentTitle}</p>
            <p className="text-muted-foreground text-xs">
              Q{currentIdx + 1}/{attempt.questions.length} · {answeredCount} answered
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <SaveIndicator state={currentSaveState} />
            {requiresLockdown && lockdown.isFullscreen && (
              <div className="bg-success/10 text-success hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium sm:flex">
                <Lock className="h-3 w-3" />
                Secure
              </div>
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-sm font-semibold tabular-nums",
                timerDanger ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <ProctoringBanner
        violations={proctoring.violations}
        maxViolations={attempt.proctoringMaxViolations}
        lastEvent={proctoring.lastEvent}
        isBlocked={proctoring.isBlocked}
        reportError={proctoring.reportError}
      />

      {/* Question body */}
      <div className="flex-1 py-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Q{q.position}</Badge>
              <Badge>{q.points} pts</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFlag(q.id)}
              className={flags.has(q.id) ? "text-warning" : ""}
              aria-label={flags.has(q.id) ? "Unflag" : "Flag"}
            >
              <Flag className="mr-1 h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {flags.has(q.id) ? "Flagged" : "Flag"}
              </span>
            </Button>
          </div>

          <h2 className="mt-3 text-base font-medium whitespace-pre-line sm:text-lg">
            {q.text}
          </h2>

          <div className="mt-4">
            <QuestionRenderer
              question={q}
              value={answers[q.id]}
              onChange={(next) => updateAnswer(q.id, next)}
            />
          </div>
        </Card>
      </div>

      {/* Sticky bottom action bar — always reachable */}
      <div className="border-border bg-background/95 pb-safe sticky bottom-0 z-20 -mx-4 -mb-4 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="flex-1 sm:flex-initial"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setNavigatorOpen(true)}
            className="flex-1 sm:hidden"
          >
            <ListChecks className="mr-1 h-4 w-4" />
            Navigate
          </Button>

          {!isLast ? (
            <Button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex-1 sm:flex-initial"
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setConfirmSubmit(true)}
              className="flex-1 sm:flex-initial"
            >
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Question navigator — drawer on mobile, sidebar on desktop */}
      <aside className="hidden lg:fixed lg:top-24 lg:right-6 lg:block lg:w-56">
        <Card className="p-4">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
            Questions
          </p>
          <QuestionGrid
            attempt={attempt}
            answers={answers}
            flags={flags}
            currentIdx={currentIdx}
            onSelect={setCurrentIdx}
          />
          <Button
            className="mt-4 w-full"
            onClick={() => setConfirmSubmit(true)}
            loading={submitMutation.isPending}
          >
            Submit
          </Button>
        </Card>
      </aside>

      {navigatorOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-black/50"
            onClick={() => setNavigatorOpen(false)}
            aria-hidden
          />
          <div className="animate-slide-in border-border bg-background pb-safe absolute right-0 bottom-0 left-0 rounded-t-2xl border-t">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Questions</p>
                <p className="text-muted-foreground text-xs">
                  {answeredCount}/{attempt.questions.length} answered
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNavigatorOpen(false)}
                aria-label="Close navigator"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <QuestionGrid
                attempt={attempt}
                answers={answers}
                flags={flags}
                currentIdx={currentIdx}
                onSelect={goTo}
              />
              <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                <Button variant="outline" onClick={() => setConfirmSubmit(true)}>
                  Submit
                </Button>
                <p className="text-muted-foreground text-xs">Tap a number to jump</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        title="Submit assessment?"
        description={`You have answered ${answeredCount} of ${attempt.questions.length} questions. You cannot change your answers after submission.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmSubmit(false)}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              Yes, submit
            </Button>
          </>
        }
      >
        {answeredCount < attempt.questions.length && (
          <div className="border-warning/30 bg-warning/10 rounded-md border p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {attempt.questions.length - answeredCount} question(s) still unanswered.
              </span>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={invigilatorMessage !== null}
        onClose={() => setInvigilatorMessage(null)}
        title="Message from your CA invigilator"
        description="Please read and acknowledge this message before continuing."
        locked
        footer={
          <Button onClick={() => setInvigilatorMessage(null)}>Acknowledge message</Button>
        }
      >
        <div className="border-primary/30 bg-primary/10 text-foreground rounded-md border p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm whitespace-pre-wrap">{invigilatorMessage}</p>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={proctoringModal}
        onClose={() => {}}
        title="Attempt submitted for integrity reasons"
        description="You exceeded the maximum number of proctoring violations. Your attempt has been submitted automatically."
        locked
      >
        <div className="border-danger/30 bg-danger/10 text-danger rounded-md border p-3 text-sm">
          Your responses up to the point of submission have been saved and will be graded.
          The lecturer has access to the full integrity log.
        </div>
        <p className="text-muted-foreground mt-3 text-xs">Submitting and redirecting…</p>
      </Dialog>
    </div>
  );
}

function QuestionGrid({
  attempt,
  answers,
  flags,
  currentIdx,
  onSelect,
}: {
  attempt: AttemptLive;
  answers: Record<string, AttemptAnswerState>;
  flags: Set<string>;
  currentIdx: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {attempt.questions.map((question, i) => {
        const answered = !isAnswerEmpty(answers[question.id]);
        const isCurrent = i === currentIdx;
        const isFlagged = flags.has(question.id);
        return (
          <button
            key={question.id}
            onClick={() => onSelect(i)}
            className={cn(
              "flex h-10 items-center justify-center rounded-md border text-sm font-medium transition-colors",
              isCurrent && "border-primary bg-primary text-primary-foreground",
              !isCurrent && answered && "border-success/40 bg-success/10 text-success",
              !isCurrent && !answered && "border-border hover:bg-surface",
              isFlagged && !isCurrent && "ring-warning ring-1"
            )}
            aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${
              isFlagged ? ", flagged" : ""
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const map = {
    saving: { label: "Saving…", color: "text-muted-foreground" },
    saved: { label: "Saved", color: "text-success" },
    error: { label: "Error", color: "text-danger" },
  } as const;
  const info = map[state];
  return (
    <span className={cn("text-xs font-medium", info.color)}>
      {state === "saved" && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
      {info.label}
    </span>
  );
}
