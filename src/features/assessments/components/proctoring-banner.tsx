"use client";
import { AlertTriangle, EyeOff, MonitorX, MousePointer2Off } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { ProctoringEventType } from "../types/proctoring.types";

interface Props {
  violations: number;
  maxViolations: number;
  lastEvent: ProctoringEventType | null;
  isBlocked: boolean;
  reportError?: string | null;
}

const ICONS: Record<ProctoringEventType, typeof AlertTriangle> = {
  TAB_SWITCH: EyeOff,
  WINDOW_BLUR: EyeOff,
  FULLSCREEN_EXIT: MonitorX,
  CONTEXT_MENU: MousePointer2Off,
  COPY: MousePointer2Off,
  PASTE: MousePointer2Off,
  HEARTBEAT_GAP: EyeOff,
  OTHER: AlertTriangle,
};

const MESSAGES: Record<ProctoringEventType, string> = {
  TAB_SWITCH: "You switched tabs. Stay on this page during the exam.",
  WINDOW_BLUR: "The exam window lost focus. Keep it in front.",
  FULLSCREEN_EXIT: "You exited fullscreen mode.",
  CONTEXT_MENU: "Right-click is disabled during proctored exams.",
  COPY: "Copying is disabled during proctored exams.",
  PASTE: "Pasting is disabled during proctored exams.",
  HEARTBEAT_GAP: "The exam connection was interrupted for too long.",
  OTHER: "Unusual activity was detected.",
};

export function ProctoringBanner({
  violations,
  maxViolations,
  lastEvent,
  isBlocked,
  reportError,
}: Props) {
  if (violations === 0 && !reportError) return null;

  const remaining = maxViolations > 0 ? Math.max(0, maxViolations - violations) : null;
  const danger = isBlocked || (remaining !== null && remaining <= 1);
  const Icon = lastEvent ? ICONS[lastEvent] : AlertTriangle;
  const message = lastEvent ? MESSAGES[lastEvent] : "Integrity warning.";

  return (
    <div
      role="alert"
      className={cn(
        "sticky top-0 z-30 -mx-4 border-b px-4 py-2.5 sm:-mx-6 sm:px-6",
        danger ? "border-danger/40 bg-danger/15" : "border-warning/40 bg-warning/15"
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            danger ? "text-danger" : "text-warning"
          )}
        />
        <div className="min-w-0 flex-1 text-sm">
          <p className={cn("font-medium", danger ? "text-danger" : "text-warning")}>
            {message}
          </p>
          <p className="text-muted-foreground text-xs">
            {reportError
              ? `Unable to record the latest event: ${reportError}`
              : `${violations} violation${violations === 1 ? "" : "s"} logged${
                  remaining !== null ? ` · ${remaining} remaining before auto-submit` : ""
                }`}
          </p>
        </div>
      </div>
    </div>
  );
}
