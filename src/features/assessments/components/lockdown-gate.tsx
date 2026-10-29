"use client";
import { useState } from "react";
import { Lock, Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  onEntered: () => void;
  isRecovery?: boolean;
  enterLockdown: () => Promise<boolean>;
}

export function LockdownGate({ onEntered, isRecovery, enterLockdown }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setError(null);
    const ok = await enterLockdown();
    setBusy(false);
    if (ok) onEntered();
    else
      setError(
        "Could not enter secure mode. Your browser may block fullscreen — allow it for this site and try again."
      );
  };

  return (
    <div className="bg-background/95 fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="bg-warning/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Lock className="text-warning h-7 w-7" />
          </div>
          <h2 className="text-xl font-semibold">
            {isRecovery ? "Secure mode paused" : "Secure exam mode"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {isRecovery
              ? "You exited fullscreen. Return to secure mode to continue your exam."
              : "This proctored exam requires fullscreen. Your cursor will be locked inside this window while you take the exam."}
          </p>
          <Button className="mt-6 w-full" onClick={onClick} loading={busy}>
            <Maximize2 className="mr-1.5 h-4 w-4" />
            {isRecovery ? "Return to secure mode" : "Enter secure mode"}
          </Button>
          {error && (
            <p className="border-danger/30 bg-danger/10 text-danger mt-3 rounded-md border px-3 py-2 text-sm">
              {error}
            </p>
          )}
          <p className="text-muted-foreground mt-4 text-xs">
            Pressing <kbd className="bg-muted rounded px-1">Esc</kbd> exits fullscreen. If
            you do, the exam pauses until you return.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
