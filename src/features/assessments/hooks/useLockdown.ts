"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { post } from "@/lib/api/client";
import {
  getFullscreenElement,
  subscribeToFullscreenChange,
} from "@/lib/utils/fullscreen";

interface UseLockdownOptions {
  attemptId: string;
  enabled: boolean;
  onExitAttempted: () => void; // called when fullscreen is exited
  onServerSubmitted?: () => void;
}

interface LockdownState {
  isFullscreen: boolean;
  isPointerLocked: boolean;
  needsRecovery: boolean; // true when overlay should block the exam
  enterLockdown: () => Promise<boolean>;
}

const HEARTBEAT_INTERVAL_MS = 15_000;

export function useLockdown({
  attemptId,
  enabled,
  onExitAttempted,
  onServerSubmitted,
}: UseLockdownOptions): LockdownState {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);

  const onExitRef = useRef(onExitAttempted);
  const onServerSubmittedRef = useRef(onServerSubmitted);
  useEffect(() => {
    onExitRef.current = onExitAttempted;
    onServerSubmittedRef.current = onServerSubmitted;
  }, [onExitAttempted, onServerSubmitted]);

  const enterLockdown = useCallback(async (): Promise<boolean> => {
    try {
      // Request fullscreen first (user gesture required — must be triggered by click)
      if (!getFullscreenElement()) {
        await document.documentElement.requestFullscreen();
      }
      // Then pointer lock — cursor physically cannot leave the window
      try {
        await document.body.requestPointerLock();
      } catch {
        // Some browsers block pointer lock without gesture — non-fatal
      }
      setNeedsRecovery(false);
      return true;
    } catch (err) {
      console.warn("[lockdown] fullscreen request failed:", err);
      return false;
    }
  }, []);

  // Track fullscreen state
  useEffect(() => {
    if (!enabled) return;

    const onFullscreenChange = () => {
      const active = !!getFullscreenElement();
      setIsFullscreen(active);
      if (!active) {
        setNeedsRecovery(true);
        onExitRef.current();
      }
    };
    // Prime the state on mount
    setIsFullscreen(!!getFullscreenElement());
    return subscribeToFullscreenChange(onFullscreenChange);
  }, [enabled]);

  // Track pointer lock state
  useEffect(() => {
    if (!enabled) return;

    const onPointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === document.body);
    };
    document.addEventListener("pointerlockchange", onPointerLockChange);
    setIsPointerLocked(document.pointerLockElement === document.body);
    return () => document.removeEventListener("pointerlockchange", onPointerLockChange);
  }, [enabled]);

  // Heartbeat — silently detects background tab via gap on the backend
  useEffect(() => {
    if (!enabled) return;
    const send = async () => {
      try {
        const response = await post<{
          success: boolean;
          data?: { autoSubmitted?: boolean };
        }>(`/assessment-attempts/${attemptId}/heartbeat/`);
        if (response.data?.autoSubmitted) {
          onServerSubmittedRef.current?.();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Heartbeat failed.";
        console.warn("[proctoring] heartbeat failed:", message);
      }
    };
    send();
    const interval = setInterval(send, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, attemptId]);

  return { isFullscreen, isPointerLocked, needsRecovery, enterLockdown };
}
