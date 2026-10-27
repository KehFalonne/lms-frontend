"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useCreateBankQuestion } from "../hooks/useAssessments";

interface Option {
  text: string;
  isCorrect: boolean;
}

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Multiple choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "SHORT_ANSWER", label: "Short answer" },
  { value: "LONG_ANSWER", label: "Essay" },
  { value: "NUMERIC", label: "Numeric" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  bankId: string;
  onCreated?: () => void;
}

export function QuestionEditorDialog({ open, onClose, bankId, onCreated }: Props) {
  const create = useCreateBankQuestion(bankId);

  const [type, setType] = useState("MULTIPLE_CHOICE");
  const [text, setText] = useState("");
  const [points, setPoints] = useState("1");
  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [answerKey, setAnswerKey] = useState("");
  const [numericAnswer, setNumericAnswer] = useState("");
  const [sampleAnswer, setSampleAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setType("MULTIPLE_CHOICE");
    setText("");
    setPoints("1");
    setOptions([
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setAnswerKey("");
    setNumericAnswer("");
    setSampleAnswer("");
    setError(null);
  };

  const onSubmit = () => {
    setError(null);
    if (!text.trim()) {
      setError("Question text is required.");
      return;
    }

    const payload: any = {
      questionBankId: bankId,
      questionType: type,
      text: text.trim(),
      defaultPoints: points,
    };

    if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
      const opts =
        type === "TRUE_FALSE"
          ? [
              { text: "True", isCorrect: true, position: 1 },
              { text: "False", isCorrect: false, position: 2 },
            ]
          : options
              .map((o, i) => ({ ...o, position: i + 1, text: o.text.trim() }))
              .filter((o) => o.text);

      if (opts.length < 2) {
        setError("Provide at least 2 options.");
        return;
      }
      if (!opts.some((o) => o.isCorrect)) {
        setError("Mark at least one option as correct.");
        return;
      }
      if (type === "MULTIPLE_CHOICE" && opts.filter((o) => o.isCorrect).length !== 1) {
        setError("Mark exactly one option as correct for Multiple Choice.");
        return;
      }
      payload.options = opts;
    } else if (type === "SHORT_ANSWER") {
      const keys = answerKey
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (keys.length === 0) {
        setError("Provide at least one accepted answer.");
        return;
      }
      payload.answerKey = keys;
    } else if (type === "NUMERIC") {
      if (!numericAnswer.trim() || isNaN(Number(numericAnswer))) {
        setError("Enter a valid numeric answer.");
        return;
      }
      payload.numericAnswer = numericAnswer;
      payload.numericTolerance = "0";
    } else if (type === "LONG_ANSWER") {
      payload.sampleAnswer = sampleAnswer;
    }

    create.mutate(payload, {
      onSuccess: () => {
        reset();
        onCreated?.();
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => !create.isPending && onClose()}
      title="New Question"
      description="It saves to the question bank and can be reused."
      size="xl"
      locked={create.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={create.isPending}>
            Save question
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Type</label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={QUESTION_TYPES}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Default points</label>
            <Input
              type="number"
              step="0.5"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Question text <span className="text-danger">*</span>
          </label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>

        {type === "MULTIPLE_CHOICE" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Options</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={opt.isCorrect}
                    onChange={() =>
                      setOptions((prev) =>
                        prev.map((o, idx) => ({ ...o, isCorrect: idx === i }))
                      )
                    }
                    className="h-4 w-4"
                  />
                  <Input
                    value={opt.text}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = { ...next[i], text: e.target.value };
                      setOptions(next);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setOptions((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() =>
                setOptions((prev) => [...prev, { text: "", isCorrect: false }])
              }
            >
              <Plus className="mr-1 h-4 w-4" /> Add option
            </Button>
          </div>
        )}

        {type === "TRUE_FALSE" && (
          <div className="border-border bg-surface/50 rounded-md border p-3 text-sm">
            <p className="font-medium">Options</p>
            <p className="text-muted-foreground mt-1 text-xs">
              True (correct by default) / False. Adjust the correct answer by editing
              later or switching to Multiple Choice.
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setType("TRUE_FALSE")}>
                True is correct
              </Button>
            </div>
          </div>
        )}

        {type === "SHORT_ANSWER" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Accepted answers{" "}
              <span className="text-muted-foreground">(comma-separated)</span>
            </label>
            <Input
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
              placeholder="DISTINCT, distinct"
            />
          </div>
        )}

        {type === "NUMERIC" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Numeric answer</label>
            <Input
              type="number"
              value={numericAnswer}
              onChange={(e) => setNumericAnswer(e.target.value)}
              placeholder="e.g. 42"
            />
          </div>
        )}

        {type === "LONG_ANSWER" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Grading guide <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              value={sampleAnswer}
              onChange={(e) => setSampleAnswer(e.target.value)}
              rows={4}
              placeholder="What to look for when grading"
            />
          </div>
        )}

        {error && (
          <div className="border-danger/30 bg-danger/10 text-danger rounded-md border p-3 text-sm">
            {error}
          </div>
        )}
      </div>
    </Dialog>
  );
}
