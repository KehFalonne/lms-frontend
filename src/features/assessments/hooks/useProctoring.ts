"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { logProctoringEvent } from "../api/assessments.api";
import type { ProctoringEventType } from "../types/proctoring.types";

interface UseProctoringOptions {
  attemptId: string;
  enabled: boolean;
  initialViolations?: number;
  enforcement?: "REVIEW_ONLY" | "AUTO_SUBMIT";
  onMaxReached?: () => void;
}

interface ProctoringState {
  violations: number;
  lastEvent: ProctoringEventType | null;
  isBlocked: boolean;
  reportError: string | null;
}

const DEBOUNCE_MS = 3000; // was 1000 — 3s window for dedupe

export function useProctoring({
  attemptId,
  enabled,
  initialViolations = 0,
  enforcement = "REVIEW_ONLY",
  onMaxReached,
}: UseProctoringOptions): ProctoringState {
  const [violations, setViolations] = useState(initialViolations);
  const [lastEvent, setLastEvent] = useState<ProctoringEventType | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const violationsRef = useRef(initialViolations);
  const lastEventTsRef = useRef(0);
  const blockedRef = useRef(false);
  const attentionLossRef = useRef(false); // dedupe tab_switch + blur

  const onMaxRef = useRef(onMaxReached);
  useEffect(() => {
    onMaxRef.current = onMaxReached;
  });

  const emit = useCallback(
    async (eventType: ProctoringEventType, detail: Record<string, unknown> = {}) => {
      if (!enabled || blockedRef.current) return;

      const now = Date.now();
      if (now - lastEventTsRef.current < DEBOUNCE_MS) return;
      lastEventTsRef.current = now;

      try {
        const response = await logProctoringEvent(attemptId, eventType, detail);
        const result = response.data;
        violationsRef.current = result.violationCount;
        setViolations(result.violationCount);
        setLastEvent(eventType);
        setReportError(null);

        if (
          result.thresholdReached &&
          enforcement === "AUTO_SUBMIT" &&
          result.autoSubmitted
        ) {
          blockedRef.current = true;
          setIsBlocked(true);
          onMaxRef.current?.();
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not report activity.";
        setReportError(message);
        console.warn("[proctoring] event report failed:", message);
      }
    },
    [enabled, attemptId, enforcement]
  );

  useEffect(() => {
    if (!enabled) return;

    // ── Coalesce tab switch + window blur into a single violation ──
    const onAttentionLoss = (preferredType: ProctoringEventType) => {
      if (attentionLossRef.current) return;
      attentionLossRef.current = true;
      emit(preferredType);
    };
    const onAttentionReturn = () => {
      attentionLossRef.current = false;
    };

    const onVisibility = () => {
      if (document.hidden) onAttentionLoss("TAB_SWITCH");
      else onAttentionReturn();
    };
    const onBlur = () => onAttentionLoss("WINDOW_BLUR");
    const onFocus = () => onAttentionReturn();

    const onFullscreen = () => {
      if (document.fullscreenElement) return;
      // Skip when a modal is open — that's the app, not the student
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      emit("FULLSCREEN_EXIT");
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      emit("CONTEXT_MENU");
    };
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      emit("COPY");
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      emit("PASTE");
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (blockedRef.current) return;
      emit("OTHER", { reason: "before_unload" });
      e.preventDefault();
      e.returnValue = "";
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled, emit]);

  return { violations, lastEvent, isBlocked, reportError };
}
