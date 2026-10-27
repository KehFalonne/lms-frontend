"use client";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateUser } from "../hooks/useAdminUsers";

const schema = z.object({
  email: z.string().trim().email("Valid email required"),
  universityId: z.string().trim().min(2, "Required"),
  password: z.string().min(8, "At least 8 characters"),
  firstName: z.string().trim().min(1, "Required"),
  middleName: z.string(),
  lastName: z.string().trim().min(1, "Required"),
  phone: z.string(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE", "LOCKED"]),
  roleType: z.enum(["student", "staff", "none"]),
  // student-only
  matriculeNumber: z.string(),
  currentLevel: z.number().min(100).max(900),
  admissionYear: z.number().min(2000).max(2100),
  // staff-only
  staffNumber: z.string(),
  jobTitle: z.string(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function UserFormDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateUser();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      universityId: "",
      password: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      status: "ACTIVE",
      roleType: "student",
      matriculeNumber: "",
      currentLevel: 100,
      admissionYear: new Date().getFullYear(),
      staffNumber: "",
      jobTitle: "",
    },
  });

  const roleType = watch("roleType");

  const onSubmit: SubmitHandler<FormOutput> = (data) => {
    create.mutate(
      {
        email: data.email,
        universityId: data.universityId,
        password: data.password,
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        phone: data.phone || undefined,
        status: data.status,
        ...(data.roleType === "student"
          ? {
              matriculeNumber: data.matriculeNumber || undefined,
              currentLevel: data.currentLevel,
              admissionYear: data.admissionYear,
            }
          : {}),
        ...(data.roleType === "staff"
          ? {
              staffNumber: data.staffNumber || undefined,
              jobTitle: data.jobTitle || undefined,
            }
          : {}),
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
        <Plus className="mr-1.5 h-4 w-4" /> New User
      </Button>

      <Dialog
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title="New User"
        description="Create a user account. Roles can be assigned afterward."
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
              Create user
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email <span className="text-danger">*</span>
              </label>
              <Input type="email" {...register("email")} />
              {errors.email && (
                <p className="text-danger mt-1 text-xs">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                University ID <span className="text-danger">*</span>
              </label>
              <Input {...register("universityId")} placeholder="GU0002" />
              {errors.universityId && (
                <p className="text-danger mt-1 text-xs">{errors.universityId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Password <span className="text-danger">*</span>
            </label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-danger mt-1 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                First name <span className="text-danger">*</span>
              </label>
              <Input {...register("firstName")} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Middle name</label>
              <Input {...register("middleName")} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Last name <span className="text-danger">*</span>
              </label>
              <Input {...register("lastName")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone</label>
              <Input {...register("phone")} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <Select
                {...register("status")}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "PENDING", label: "Pending" },
                  { value: "SUSPENDED", label: "Suspended" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "LOCKED", label: "Locked" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Profile type</label>
            <Select
              {...register("roleType")}
              options={[
                { value: "student", label: "Student (creates student profile)" },
                { value: "staff", label: "Staff (creates staff profile)" },
                { value: "none", label: "None (bare user)" },
              ]}
            />
          </div>

          {roleType === "student" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Matricule</label>
                <Input {...register("matriculeNumber")} placeholder="GU-2026-001234" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Level</label>
                <Input
                  type="number"
                  {...register("currentLevel", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Admission Year</label>
                <Input
                  type="number"
                  {...register("admissionYear", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          {roleType === "staff" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Staff Number</label>
                <Input {...register("staffNumber")} placeholder="GU-STAFF-0001" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Job Title</label>
                <Input {...register("jobTitle")} placeholder="Senior Lecturer" />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
