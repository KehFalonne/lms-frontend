"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import type { AttemptAnswerState, AttemptLiveQuestion } from "../types/assessment.types";

interface Props {
  question: AttemptLiveQuestion;
  value: AttemptAnswerState | undefined;
  onChange: (next: AttemptAnswerState) => void;
  disabled?: boolean;
}

const EMPTY: AttemptAnswerState = {
  answerText: "",
  selectedOptionIds: [],
  numericAnswer: null,
  answerData: {},
};

export function QuestionRenderer({ question, value, onChange, disabled }: Props) {
  const current = value ?? EMPTY;

  if (
    question.questionType === "MULTIPLE_CHOICE" ||
    question.questionType === "TRUE_FALSE"
  ) {
    return (
      <div className="space-y-2">
        {question.options.map((opt) => {
          const selected = current.selectedOptionIds.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-surface",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="radio"
                name={question.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange({ ...current, selectedOptionIds: [opt.id] })}
                className="h-4 w-4"
              />
              <span>{opt.text}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.questionType === "MULTIPLE_ANSWER") {
    return (
      <div className="space-y-2">
        {question.options.map((opt) => {
          const selected = current.selectedOptionIds.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-surface",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...current.selectedOptionIds, opt.id]
                    : current.selectedOptionIds.filter((id) => id !== opt.id);
                  onChange({ ...current, selectedOptionIds: next });
                }}
                className="h-4 w-4"
              />
              <span>{opt.text}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.questionType === "NUMERIC") {
    return (
      <Input
        type="number"
        value={current.numericAnswer ?? ""}
        disabled={disabled}
        onChange={(e) =>
          onChange({
            ...current,
            numericAnswer: e.target.value === "" ? null : e.target.value,
          })
        }
        placeholder="Enter a number"
        className="w-40"
      />
    );
  }

  if (question.questionType === "FILL_BLANK") {
    const blanks = (current.answerData.blanks as string[]) ?? [];
    const count = question.blankCount ?? 1;
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-muted-foreground w-16 text-xs">Blank {i + 1}</span>
            <Input
              value={blanks[i] ?? ""}
              disabled={disabled}
              onChange={(e) => {
                const next = [...blanks];
                while (next.length < count) next.push("");
                next[i] = e.target.value;
                onChange({
                  ...current,
                  answerData: { ...current.answerData, blanks: next },
                });
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (question.questionType === "MATCHING") {
    const matches = (current.answerData.matches as Record<string, string>) ?? {};
    return (
      <div className="space-y-2">
        {question.matchingPairs.map((pair, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-1 text-sm">{pair.left}</span>
            <Input
              value={matches[pair.left] ?? ""}
              disabled={disabled}
              onChange={(e) =>
                onChange({
                  ...current,
                  answerData: {
                    ...current.answerData,
                    matches: { ...matches, [pair.left]: e.target.value },
                  },
                })
              }
              placeholder="Match"
              className="flex-1"
            />
          </div>
        ))}
      </div>
    );
  }

  // SHORT_ANSWER, LONG_ANSWER (and any unknown types)
  return (
    <Textarea
      value={current.answerText}
      disabled={disabled}
      onChange={(e) => onChange({ ...current, answerText: e.target.value })}
      placeholder="Type your answer..."
      rows={question.questionType === "LONG_ANSWER" ? 8 : 3}
    />
  );
}

export function isAnswerEmpty(a: AttemptAnswerState | undefined): boolean {
  if (!a) return true;
  if (a.answerText.trim()) return false;
  if (a.selectedOptionIds.length > 0) return false;
  if (a.numericAnswer !== null && a.numericAnswer !== "") return false;
  const blanks = (a.answerData.blanks as string[]) ?? [];
  if (blanks.some((b) => b?.trim())) return false;
  const matches = (a.answerData.matches as Record<string, string>) ?? {};
  if (Object.values(matches).some((v) => v?.trim())) return false;
  return true;
}
