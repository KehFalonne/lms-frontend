"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppeal } from "../hooks/useAppeals";

interface Props {
  open: boolean;
  onClose: () => void;
  gradeId: string;
  gradeItemName: string;
  currentScore: string | null;
  maxScore: string;
}

export function AppealDialog({
  open,
  onClose,
  gradeId,
  gradeItemName,
  currentScore,
  maxScore,
}: Props) {
  const [reason, setReason] = useState("");
  const create = useCreateAppeal();

  const onSubmit = () => {
    create.mutate(
      { gradeId, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={() => !create.isPending && onClose()}
      title="Appeal grade"
      description={`${gradeItemName} — current score ${currentScore ?? "—"}/${maxScore}`}
      size="lg"
      locked={create.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            loading={create.isPending}
            disabled={reason.trim().length < 5}
          >
            Submit appeal
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Why should this grade be reconsidered?
        </label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={6}
          placeholder="Describe the issue. Be specific — include question numbers, grading criteria, etc."
        />
        <p className="text-muted-foreground text-xs">
          Your lecturer or an administrator will review this. You'll be notified when it's
          resolved.
        </p>
      </div>
    </Dialog>
  );
}
