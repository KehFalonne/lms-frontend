"use client";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useCreateAssignment } from "../hooks/useAssignments";

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

export function AssignmentFormDialog({ offeringId }: { offeringId: string }) {
  const [open, setOpen] = useState(false);
  const create = useCreateAssignment(offeringId);

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

  const onSubmit: SubmitHandler<FormOutput> = (data) => {
    create.mutate(
      {
        ...data,
        title: data.title.trim(),
        dueAt: new Date(data.dueAt).toISOString(),
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" /> New Assignment
      </Button>

      <Dialog
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title="New Assignment"
        description="It starts as a draft. Publish it after review."
        size="lg"
        locked={create.isPending}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={create.isPending}>
              Create draft
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
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea
              {...register("description")}
              placeholder="Brief overview"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Instructions</label>
            <Textarea
              {...register("instructions")}
              placeholder="What students should do"
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
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T23:59`;
}
