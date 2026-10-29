"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { post } from "@/lib/api/client";

interface UseLockdownOptions {
  attemptId: string;
  enabled: boolean;
  onExitAttempted: () => void; // called when fullscreen is exited
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
}: UseLockdownOptions): LockdownState {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);

  const onExitRef = useRef(onExitAttempted);
  useEffect(() => {
    onExitRef.current = onExitAttempted;
  });

  const enterLockdown = useCallback(async (): Promise<boolean> => {
    try {
      // Request fullscreen first (user gesture required — must be triggered by click)
      if (!document.fullscreenElement) {
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
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setNeedsRecovery(true);
        onExitRef.current();
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    // Prime the state on mount
    setIsFullscreen(!!document.fullscreenElement);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
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
    const send = () => {
      post(`/assessment-attempts/${attemptId}/heartbeat/`).catch(() => {});
    };
    send();
    const interval = setInterval(send, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, attemptId]);

  return { isFullscreen, isPointerLocked, needsRecovery, enterLockdown };
}
