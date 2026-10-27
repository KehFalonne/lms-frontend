import type { CalendarEventType } from "../types/calendar.types";

/**
 * Semantic color + short label per event type.
 *
 * We use BOTH color and a text label so color isn't the only distinguishing
 * signal (accessibility requirement).
 */
export const EVENT_STYLES: Record<
  CalendarEventType,
  { bg: string; border: string; text: string; label: string; dot: string }
> = {
  LECTURE: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    label: "Lecture",
  },
  ASSIGNMENT_DUE: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    label: "Due",
  },
  EXAM: {
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
    label: "Exam",
  },
  QUIZ: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    label: "Quiz",
  },
  MEETING: {
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800",
    text: "text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500",
    label: "Meeting",
  },
  OTHER: {
    bg: "bg-slate-50 dark:bg-slate-900/60",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
    label: "Event",
  },
};
