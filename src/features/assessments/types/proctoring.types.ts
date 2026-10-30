export type ProctoringEventType =
  | "TAB_SWITCH"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "CONTEXT_MENU"
  | "COPY"
  | "PASTE"
  | "HEARTBEAT_GAP"
  | "OTHER";

export interface ProctoringEvent {
  id: string;
  attempt: string;
  eventType: ProctoringEventType;
  detail: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string;
  createdAt: string;
}

export const PROCTORING_LABELS: Record<ProctoringEventType, string> = {
  TAB_SWITCH: "Switched tabs",
  WINDOW_BLUR: "Window lost focus",
  FULLSCREEN_EXIT: "Exited fullscreen",
  CONTEXT_MENU: "Right-clicked",
  COPY: "Attempted copy",
  PASTE: "Attempted paste",
  HEARTBEAT_GAP: "Heartbeat gap detected",
  OTHER: "Other",
};
