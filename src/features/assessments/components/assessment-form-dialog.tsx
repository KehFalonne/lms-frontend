"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useCreateAssessment } from "../hooks/useAssessments";

const schema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  description: z.string(),
  instructions: z.string(),
  assessmentType: z.enum(["QUIZ", "TEST", "MIDTERM", "FINAL_EXAM", "PRACTICE"]),
  timeLimitMinutes: z.number().min(1).max(300),
  maxAttempts: z.number().min(1).max(5),
  passingScore: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid score"),
  availableFrom: z.string(),
  availableUntil: z.string(),
});

type FormData = z.infer<typeof schema>;

export function AssessmentFormDialog({ offeringId }: { offeringId: string }) {
  const [open, setOpen] = useState(false);
  const create = useCreateAssessment(offeringId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      assessmentType: "QUIZ",
      timeLimitMinutes: 30,
      maxAttempts: 1,
      passingScore: "50.00",
      availableFrom: "",
      availableUntil: "",
    },
  });

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        ...data,
        availableFrom: data.availableFrom
          ? new Date(data.availableFrom).toISOString()
          : null,
        availableUntil: data.availableUntil
          ? new Date(data.availableUntil).toISOString()
          : null,
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
        <Plus className="mr-1.5 h-4 w-4" /> New Assessment
      </Button>

      <Dialog
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title="New Assessment"
        description="Create the assessment shell. Add questions to publish it."
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
          <div className="border-info/30 bg-info/5 flex items-start gap-2 rounded-md border p-3 text-xs">
            <Info className="text-info mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Assessment starts as a <strong>draft</strong>. Once created, use the
              question builder to add questions, then publish.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Title <span className="text-danger">*</span>
            </label>
            <Input {...register("title")} placeholder="e.g. Midterm Quiz" />
            {errors.title && (
              <p className="text-danger mt-1 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea {...register("description")} rows={2} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Instructions</label>
            <Textarea {...register("instructions")} rows={3} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Type</label>
              <Select
                {...register("assessmentType")}
                options={[
                  { value: "QUIZ", label: "Quiz" },
                  { value: "TEST", label: "Test" },
                  { value: "MIDTERM", label: "Midterm" },
                  { value: "FINAL_EXAM", label: "Final exam" },
                  { value: "PRACTICE", label: "Practice" },
                ]}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Time limit (min)</label>
              <Input
                type="number"
                min={1}
                {...register("timeLimitMinutes", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Max attempts</label>
              <Input
                type="number"
                min={1}
                max={5}
                {...register("maxAttempts", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Passing score (%)
              </label>
              <Input type="number" step="0.01" {...register("passingScore")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Available from</label>
              <Input type="datetime-local" {...register("availableFrom")} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Available until</label>
              <Input type="datetime-local" {...register("availableUntil")} />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
