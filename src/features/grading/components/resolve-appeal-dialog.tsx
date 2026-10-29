"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResolveAppeal } from "../hooks/useAppeals";
import type { GradeAppeal } from "../types/grading.types";

interface Props {
  appeal: GradeAppeal | null;
  onClose: () => void;
}

export function ResolveAppealDialog({ appeal, onClose }: Props) {
  const [decision, setDecision] = useState<"APPROVED" | "DENIED">("APPROVED");
  const [newScore, setNewScore] = useState("");
  const [notes, setNotes] = useState("");
  const resolve = useResolveAppeal();

  if (!appeal) return null;

  const onSubmit = () => {
    resolve.mutate(
      {
        appealId: appeal.id,
        payload: {
          decision,
          reviewerNotes: notes,
          newScore: decision === "APPROVED" ? newScore : null,
        },
      },
      {
        onSuccess: () => {
          setNewScore("");
          setNotes("");
          onClose();
        },
      }
    );
  };

  const canSubmit =
    decision === "DENIED" ||
    (decision === "APPROVED" &&
      newScore &&
      Number(newScore) >= 0 &&
      Number(newScore) <= Number(appeal.maxScore));

  return (
    <Dialog
      open={!!appeal}
      onClose={() => !resolve.isPending && onClose()}
      title="Resolve appeal"
      description={`${appeal.student.firstName} ${appeal.student.lastName} — ${appeal.gradeItemName}`}
      size="lg"
      locked={resolve.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={resolve.isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={resolve.isPending} disabled={!canSubmit}>
            {decision === "APPROVED" ? "Approve" : "Deny"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Student's reason
          </p>
          <p className="border-border bg-surface mt-1 rounded-md border p-3 text-sm whitespace-pre-line">
            {appeal.reason}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Decision</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDecision("APPROVED")}
              className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                decision === "APPROVED"
                  ? "border-success bg-success/10 text-success"
                  : "border-border hover:bg-surface"
              }`}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision("DENIED")}
              className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                decision === "DENIED"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border hover:bg-surface"
              }`}
            >
              Deny
            </button>
          </div>
        </div>

        {decision === "APPROVED" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              New score (out of {appeal.maxScore})
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={appeal.maxScore}
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              placeholder={`Previously: ${appeal.originalScore ?? "—"}`}
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Notes (visible to student in appeal history)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Explain the decision..."
          />
        </div>
      </div>
    </Dialog>
  );
}
