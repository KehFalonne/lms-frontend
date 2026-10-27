"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAnnouncement } from "../hooks/useAnnouncements";

const schema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  body: z.string().trim().min(5, "Body is required"),
  isPinned: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function AnnouncementFormDialog({ offeringId }: { offeringId: string }) {
  const [open, setOpen] = useState(false);
  const create = useCreateAnnouncement(offeringId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", body: "", isPinned: false },
  });

  const onSubmit = (data: FormData) => {
    create.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" /> New Announcement
      </Button>

      <Dialog
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title="New Announcement"
        description="It starts as a draft. Publish it to notify students."
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
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-danger mt-1 text-xs">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Body <span className="text-danger">*</span>
            </label>
            <Textarea {...register("body")} rows={6} />
            {errors.body && (
              <p className="text-danger mt-1 text-xs">{errors.body.message}</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isPinned")} className="h-4 w-4" />
            Pin to top
          </label>
        </div>
      </Dialog>
    </>
  );
}
