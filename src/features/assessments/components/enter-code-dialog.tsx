"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEnterCode } from "../hooks/useAssessments";

interface Props {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
}

export function EnterCodeDialog({ open, onClose, assessmentId }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const enter = useEnterCode(assessmentId);

  const onSubmit = () => {
    setError(null);
    enter.mutate(code.trim(), {
      onSuccess: (res) => {
        router.push(`/assessments/${assessmentId}/attempt/${res.data.id}`);
      },
      onError: (err) => {
        const msg = (err as { message?: string })?.message ?? "Invalid code.";
        setError(msg);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => !enter.isPending && onClose()}
      title="Enter access code"
      description="Your instructor will share the code at the start of the exam window."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={enter.isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={enter.isPending} disabled={!code.trim()}>
            <KeyRound className="mr-1.5 h-4 w-4" />
            Enter
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Access code</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            autoFocus
            autoComplete="off"
            inputMode="text"
            className="text-center font-mono text-lg tracking-widest"
            maxLength={12}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.trim()) onSubmit();
            }}
          />
        </div>
        {error && (
          <p className="border-danger/30 bg-danger/10 text-danger rounded-md border px-3 py-2 text-sm">
            {error}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          Entering a wrong code too many times will temporarily lock code entry for this
          assessment.
        </p>
      </div>
    </Dialog>
  );
}
