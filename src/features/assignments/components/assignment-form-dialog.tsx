"use client";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Paperclip, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FileUploader, type UploadedFile } from "@/components/ui/file-uploader";
import { formatBytes } from "@/lib/utils/format";
import { useCreateAssignment, useUpdateAssignment } from "../hooks/useAssignments";
import type { AssignmentDetail } from "../types/assignment.types";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string(),
  instructions: z.string(),
  maxScore: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid score"),
  dueAt: z.string().min(1, "Due date is required"),
  submissionType: z.enum(["FILE_UPLOAD", "TEXT_ENTRY", "FILE_AND_TEXT", "EXTERNAL_TOOL"]),
  maxAttempts: z.number().min(1).max(10),
  allowLateSubmission: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function AssignmentFormDialog({
  offeringId,
  assignment,
  onEditClosed,
}: {
  offeringId: string;
  assignment?: AssignmentDetail | null;
  onEditClosed?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [questionFiles, setQuestionFiles] = useState<UploadedFile[]>([]);
  const create = useCreateAssignment(offeringId);
  const update = useUpdateAssignment(offeringId);
  const isEditing = !!assignment;
  const isPending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      maxScore: "20.00",
      dueAt: defaultDueDate(),
      submissionType: "FILE_UPLOAD",
      maxAttempts: 1,
      allowLateSubmission: true,
    },
  });

  useEffect(() => {
    if (!assignment) return;
    reset({
      title: assignment.title,
      description: assignment.description ?? "",
      instructions: assignment.instructions ?? "",
      maxScore: assignment.maxScore,
      dueAt: toLocalInput(assignment.dueAt),
      submissionType: assignment.submissionType,
      maxAttempts: assignment.maxAttempts,
      allowLateSubmission: assignment.allowLateSubmission,
    });
    setQuestionFiles([]);
    setOpen(true);
  }, [assignment, reset]);

  const close = () => {
    if (isPending) return;
    setOpen(false);
    if (isEditing) {
      reset();
      onEditClosed?.();
    }
  };

  const onSubmit: SubmitHandler<FormOutput> = (data) => {
    const attachmentFileIds = questionFiles
      .filter((f) => f.status === "done" && f.fileId)
      .map((f) => f.fileId as string);
    const payload = {
      ...data,
      title: data.title.trim(),
      dueAt: new Date(data.dueAt).toISOString(),
      ...(attachmentFileIds.length > 0 ? { attachmentFileIds } : {}),
    };
    const onSuccess = () => {
      setOpen(false);
      reset();
      setQuestionFiles([]);
      onEditClosed?.();
    };
    if (isEditing && assignment) {
      update.mutate({ id: assignment.id, payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" /> New Assignment
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title={isEditing ? "Edit Assignment" : "New Assignment"}
        description={
          isEditing
            ? "Changes save immediately and are visible to students."
            : "It starts as a draft. Publish it after review."
        }
        size="lg"
        locked={isPending}
        footer={
          <>
            <Button variant="outline" onClick={close} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
              {isEditing ? "Save changes" : "Create draft"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Title <span className="text-danger">*</span>
            </label>
            <Input {...register("title")} placeholder="e.g. ER Diagram Design" />
            {errors.title && (
              <p className="text-danger mt-1 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description &amp; Questions
            </label>
            <Textarea
              {...register("description")}
              placeholder="Type the assignment questions here — one question per paragraph or line. For formatted documents, attach a question file below."
              rows={9}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Supports multi-paragraph question sets. Students see this text exactly as
              written.
            </p>
          </div>

          <div className="border-border/60 rounded-xl border p-3">
            <label className="mb-1.5 block text-sm font-medium">
              Question file <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <p className="text-muted-foreground mb-2 text-xs">
              Attach a PDF, Word, or image file containing the questions. Students can
              download it from the assignment page.
            </p>
            {isEditing && assignment.attachments?.length > 0 && (
              <ul className="mb-2 space-y-1">
                {assignment.attachments.map((att) => (
                  <li
                    key={att.id}
                    className="bg-muted/40 flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs"
                  >
                    <Paperclip className="text-primary h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{att.originalName}</span>
                    <span className="text-muted-foreground shrink-0">
                      {formatBytes(att.sizeBytes)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <FileUploader
              files={questionFiles}
              onChange={setQuestionFiles}
              prefix="materials"
              maxFiles={5}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Instructions</label>
            <Textarea
              {...register("instructions")}
              placeholder="What students should do — submission format, word count, etc."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Max score <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("maxScore")}
                placeholder="20.00"
              />
              {errors.maxScore && (
                <p className="text-danger mt-1 text-xs">{errors.maxScore.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Due at <span className="text-danger">*</span>
              </label>
              <Input type="datetime-local" {...register("dueAt")} />
              {errors.dueAt && (
                <p className="text-danger mt-1 text-xs">{errors.dueAt.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Submission type</label>
              <Select
                {...register("submissionType")}
                options={[
                  { value: "FILE_UPLOAD", label: "File upload" },
                  { value: "TEXT_ENTRY", label: "Text entry" },
                  { value: "FILE_AND_TEXT", label: "File + text" },
                  { value: "EXTERNAL_TOOL", label: "External tool" },
                ]}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Max attempts</label>
              <Input
                type="number"
                min={1}
                max={10}
                {...register("maxAttempts", { valueAsNumber: true })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register("allowLateSubmission")}
              className="h-4 w-4"
            />
            Allow late submissions
          </label>
        </div>
      </Dialog>
    </>
  );
}

function defaultDueDate(): string {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  d.setHours(23, 59, 0, 0);
  return toLocalInput(d.toISOString());
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
