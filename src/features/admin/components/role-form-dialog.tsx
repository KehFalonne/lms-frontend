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
import { useCreateRole } from "../hooks/useAdminRoles";

const schema = z.object({
  code: z.string().trim().min(2, "Code is required"),
  name: z.string().trim().min(2, "Name is required"),
  description: z.string(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function RoleFormDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateRole();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", description: "" },
  });

  const onSubmit: SubmitHandler<FormOutput> = (data) => {
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
        <Plus className="mr-1.5 h-4 w-4" /> New Role
      </Button>

      <Dialog
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title="New Role"
        description="Create a role. Assign permissions afterward."
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
              Create role
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Code <span className="text-danger">*</span>
            </label>
            <Input {...register("code")} placeholder="e.g. AUDITOR" />
            {errors.code && (
              <p className="text-danger mt-1 text-xs">{errors.code.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Name <span className="text-danger">*</span>
            </label>
            <Input {...register("name")} placeholder="e.g. Auditor" />
            {errors.name && (
              <p className="text-danger mt-1 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea {...register("description")} rows={2} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
