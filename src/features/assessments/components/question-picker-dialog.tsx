"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

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
  useBankQuestions,
  useQuestionBanks,
} from "../hooks/useAssessments";

interface Props {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
}

export function QuestionPickerDialog({ open, onClose, assessmentId }: Props) {
  const [bankId, setBankId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [attached, setAttached] = useState<Set<string>>(new Set());

  const { data: banksData, isLoading: loadingBanks } = useQuestionBanks();
  const { data: questionsData, isLoading: loadingQuestions } = useBankQuestions(bankId);
  const attach = useAttachQuestion(assessmentId);

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
        <div className="md:border-border md:border-r md:pr-4">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
            Banks
          </p>
          {loadingBanks ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : banks.length === 0 ? (
            <p className="text-muted-foreground text-xs">No banks yet.</p>
          ) : (
            <ul className="space-y-1 md:max-h-[420px] md:overflow-y-auto">
              {banks.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => {
                      setBankId(b.id);
                      setAttached(new Set());
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
                <ul className="space-y-2 md:max-h-[420px] md:overflow-y-auto md:pr-1">
                  {questions.map((q) => {
                    const isAttached = attached.has(q.id);
                    return (
                      <li key={q.id} className="border-border rounded-md border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="primary">
                                {q.questionType.replace("_", " ")}
                              </Badge>
                              <Badge>{q.defaultPoints} pts</Badge>
                              <Badge variant="outline">{q.difficulty}</Badge>
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-sm">{q.text}</p>
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
