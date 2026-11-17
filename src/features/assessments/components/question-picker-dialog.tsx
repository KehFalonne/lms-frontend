"use client";
import { useEffect, useState } from "react";
import { KeyRound, Plus, Search, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import {
  useAttachQuestion,
  useAttachQuestions,
  useBankQuestions,
  useCreateQuestionBank,
  useImportAnswerKey,
  useImportWordQuestions,
  useQuestionBanks,
  useUpdateBankQuestion,
} from "../hooks/useAssessments";

interface Props {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
  courseOfferingId: string;
}

export function QuestionPickerDialog({
  open,
  onClose,
  assessmentId,
  courseOfferingId,
}: Props) {
  const [bankId, setBankId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [attached, setAttached] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [lastImported, setLastImported] = useState<Record<string, string[]>>({});
  const [newBankName, setNewBankName] = useState("");
  const [creatingBank, setCreatingBank] = useState(false);

  const { data: banksData, isLoading: loadingBanks } = useQuestionBanks(courseOfferingId);
  const { data: questionsData, isLoading: loadingQuestions } = useBankQuestions(bankId);
  const attach = useAttachQuestion(assessmentId);
  const attachAll = useAttachQuestions(assessmentId);
  const importQuestions = useImportWordQuestions(bankId ?? "");
  const importKey = useImportAnswerKey(bankId ?? "");
  const updateQuestion = useUpdateBankQuestion();
  const createBank = useCreateQuestionBank(courseOfferingId);

  const banks = banksData?.data ?? [];
  const questions = (questionsData?.data ?? []).filter((q) => {
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (type && q.questionType !== type) return false;
    return true;
  });

  useEffect(() => {
    if (open && banks.length > 0 && !bankId) {
      setBankId(banks[0].id);
    }
  }, [open, banks, bankId]);

  const onAttach = (questionId: string) => {
    attach.mutate(
      { questionId },
      {
        onSuccess: () => {
          setAttached((prev) => new Set(prev).add(questionId));
        },
      }
    );
  };

  const onImport = (file: File) => {
    if (!bankId) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return;
    }
    importQuestions.mutate(file, {
      onSuccess: (res) => {
        const ids = res.data.map((q) => q.id);
        if (ids.length === 0) return;
        setLastImported((prev) => ({ ...prev, [bankId]: ids }));
        setAttached((prev) => new Set([...prev, ...ids]));
        attachAll.mutate(ids);
      },
    });
  };

  const onImportKey = (file: File) => {
    if (!bankId) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".docx") && !name.endsWith(".txt")) {
      return;
    }
    importKey.mutate({ file, questionIds: lastImported[bankId] });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add questions from bank"
      description="Pick existing questions or create a new one."
      size="xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {/* Bank list */}
        <div className="border-border border-b pb-3 md:border-r md:border-b-0 md:pr-4 md:pb-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Banks
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCreatingBank((value) => !value)}
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
          {(creatingBank || banks.length === 0) && (
            <form
              className="mb-3 flex gap-1.5"
              onSubmit={(event) => {
                event.preventDefault();
                const title = newBankName.trim();
                if (!title || createBank.isPending) return;
                createBank.mutate(title, {
                  onSuccess: (res) => {
                    setBankId(res.data.id);
                    setAttached(new Set());
                    setSelectedAnswers({});
                    setNewBankName("");
                    setCreatingBank(false);
                  },
                });
              }}
            >
              <Input
                placeholder="New bank name"
                value={newBankName}
                onChange={(event) => setNewBankName(event.target.value)}
                autoFocus
              />
              <Button type="submit" size="sm" loading={createBank.isPending}>
                Create
              </Button>
            </form>
          )}
          {loadingBanks ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : banks.length === 0 ? (
            <p className="text-muted-foreground text-xs">No banks yet.</p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto md:max-h-[420px]">
              {banks.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => {
                      setBankId(b.id);
                      setAttached(new Set());
                      setSelectedAnswers({});
                    }}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      bankId === b.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-surface"
                    )}
                  >
                    <div className="truncate">{b.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {b.questionCount} questions
                    </div>
                    {b.owner && (
                      <div className="text-muted-foreground truncate text-[11px]">
                        {b.owner.fullName || b.owner.email}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Question list */}
        <div>
          {!bankId ? (
            <EmptyState
              title="Select a bank"
              description="Choose a question bank from the left."
            />
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">
                  Import numbered questions with A./B. options — they are added to
                  this assessment automatically. Answer keys can be in the same
                  file or uploaded separately.
                </p>
                <div className="flex items-center gap-2">
                  <label className="border-border hover:bg-surface inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
                    <Upload className="mr-1.5 h-4 w-4" />
                    Import Word
                    <input
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      disabled={importQuestions.isPending}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onImport(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <label className="border-border hover:bg-surface inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
                    <KeyRound className="mr-1.5 h-4 w-4" />
                    Import Key
                    <input
                      type="file"
                      accept=".docx,.txt"
                      className="sr-only"
                      disabled={importKey.isPending}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onImportKey(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="All types"
                  options={[
                    { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
                    { value: "TRUE_FALSE", label: "True / False" },
                    { value: "SHORT_ANSWER", label: "Short Answer" },
                    { value: "LONG_ANSWER", label: "Essay" },
                    { value: "NUMERIC", label: "Numeric" },
                  ]}
                />
              </div>

              {loadingQuestions ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : questions.length === 0 ? (
                <EmptyState
                  title="No questions"
                  description="This bank is empty or no matches found."
                />
              ) : (
                <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 md:max-h-[420px]">
                  {questions.map((q) => {
                    const isAttached = attached.has(q.id);
                    return (
                      <li key={q.id} className="border-border rounded-md border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {(() => {
                              const options = q.options ?? [];
                              return (
                                <>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="primary">
                                {q.questionType.replace("_", " ")}
                              </Badge>
                              <Badge>{q.defaultPoints} pts</Badge>
                              <Badge variant="outline">{q.difficulty}</Badge>
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-sm">{q.text}</p>
                            {options.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {options.map((option) => (
                                  <label
                                    key={option.id}
                                    className="text-muted-foreground flex items-center gap-2 text-xs"
                                  >
                                    <input
                                      type="radio"
                                      name={`answer-${q.id}`}
                                      checked={
                                        (selectedAnswers[q.id] ??
                                          q.options?.find((item) => item.isCorrect)?.id) ===
                                        option.id
                                      }
                                      onChange={() =>
                                        setSelectedAnswers((previous) => ({
                                          ...previous,
                                          [q.id]: option.id,
                                        }))
                                      }
                                    />
                                    {String.fromCharCode(64 + option.position)}.{" "}
                                    {option.text}
                                  </label>
                                ))}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-1"
                                  disabled={
                                    !(
                                      selectedAnswers[q.id] ??
                                      options.find((item) => item.isCorrect)?.id
                                    ) || updateQuestion.isPending
                                  }
                                  onClick={() => {
                                    const correctId =
                                      selectedAnswers[q.id] ??
                                      options.find((item) => item.isCorrect)?.id;
                                    if (!correctId) return;
                                    updateQuestion.mutate(
                                      {
                                        questionId: q.id,
                                        options: options.map((option) => ({
                                          text: option.text,
                                          position: option.position,
                                          isCorrect: option.id === correctId,
                                        })),
                                      },
                                      {
                                        onSuccess: () =>
                                          setSelectedAnswers((previous) => {
                                            const next = { ...previous };
                                            delete next[q.id];
                                            return next;
                                          }),
                                      }
                                    );
                                  }}
                                >
                                  Save correct answer
                                </Button>
                              </div>
                            )}
                                </>
                              );
                            })()}
                          </div>
                          <Button
                            size="sm"
                            variant={isAttached ? "outline" : "primary"}
                            disabled={isAttached}
                            loading={
                              attach.isPending && attach.variables?.questionId === q.id
                            }
                            onClick={() => onAttach(q.id)}
                          >
                            {isAttached ? "Added" : "Add"}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
