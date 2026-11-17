"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateUser, useUpdateUser } from "../hooks/useAdminUsers";
import type { AdminUser } from "../types/admin.types";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { uploadFile } from "@/features/files/api/files.api";

interface FacultyOption {
  id: string;
  code: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  code: string;
  name: string;
  faculty: { id: string } | null;
}

interface ProgrammeOption {
  id: string;
  code: string;
  name: string;
  department: { id: string } | null;
}

const schema = z
  .object({
    email: z.string().trim().email("Valid email required"),
    universityId: z.string().trim().min(2, "Required"),
    password: z.string().refine((value) => !value || value.length >= 8, {
      message: "At least 8 characters",
    }),
    firstName: z.string().trim().min(1, "Required"),
    middleName: z.string(),
    lastName: z.string().trim().min(1, "Required"),
    phone: z.string(),
    status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE", "LOCKED"]),
    roleType: z.enum(["student", "staff", "none"]),
    facultyId: z.string(),
    departmentId: z.string(),
    programmeId: z.string(),
    // student-only
    matriculeNumber: z.string(),
    currentLevel: z.number().min(100).max(900),
    admissionYear: z.number().min(2000).max(2100),
    admissionDate: z.string(),
    studentStatus: z.enum(["ACTIVE", "On_LEAVE", "SUSPENDED", "GRADUATED", "WITHDRAWN"]),
    // staff-only
    staffNumber: z.string(),
    jobTitle: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.roleType === "staff" && !data.staffNumber.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["staffNumber"],
        message: "Staff number is required for a staff profile.",
      });
    }
    if (data.roleType !== "none" && !data.facultyId) {
      ctx.addIssue({
        code: "custom",
        path: ["facultyId"],
        message: "Faculty is required.",
      });
    }
    if (data.roleType === "student" && !data.programmeId) {
      ctx.addIssue({
        code: "custom",
        path: ["programmeId"],
        message: "Programme is required for a student profile.",
      });
    }
    if (data.roleType === "student" && !data.matriculeNumber.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["matriculeNumber"],
        message: "Matricule is required for a student profile.",
      });
    }
    if (data.roleType === "staff" && !data.departmentId) {
      ctx.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Department is required for a staff profile.",
      });
    }
  });

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function UserFormDialog({ user }: { user?: AdminUser | null }) {
  const [open, setOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const create = useCreateUser();
  const update = useUpdateUser(user?.id ?? "");
  const isEditing = Boolean(user);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
      facultyId: "",
      departmentId: "",
      programmeId: "",
      matriculeNumber: "",
      currentLevel: 100,
      admissionYear: new Date().getFullYear(),
      admissionDate: "",
      studentStatus: "ACTIVE",
      staffNumber: "",
      jobTitle: "",
    },
  });

  useEffect(() => {
    if (!open || !user) return;
    const profileType = user.studentProfile
      ? "student"
      : user.staffProfile
        ? "staff"
        : "none";
    reset({
      email: user.email,
      universityId: user.universityId,
      password: "",
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      roleType: profileType,
      facultyId: user.studentProfile?.facultyId ?? user.staffProfile?.facultyId ?? "",
      departmentId: user.staffProfile?.departmentId ?? "",
      programmeId: user.studentProfile?.programmeId ?? "",
      matriculeNumber: user.studentProfile?.matriculeNumber ?? "",
      currentLevel: user.studentProfile?.currentLevel ?? 100,
      admissionYear: user.studentProfile?.admissionYear ?? new Date().getFullYear(),
      admissionDate: user.studentProfile?.admissionDate ?? "",
      studentStatus: user.studentProfile?.status ?? "ACTIVE",
      staffNumber: user.staffProfile?.staffNumber ?? "",
      jobTitle: user.staffProfile?.jobTitle ?? "",
    });
  }, [open, user, reset]);

  const roleType = watch("roleType");
  const facultyId = watch("facultyId");
  const departmentId = watch("departmentId");
  const { data: facultiesData } = useQuery({
    queryKey: ["user-form-faculties"],
    queryFn: () => get<ApiResponse<FacultyOption[]>>("/faculties/"),
    enabled: open,
    staleTime: 5 * 60_000,
  });
  const { data: departmentsData } = useQuery({
    queryKey: ["user-form-departments"],
    queryFn: () => get<ApiResponse<DepartmentOption[]>>("/departments/"),
    enabled: open,
    staleTime: 5 * 60_000,
  });
  const { data: programmesData } = useQuery({
    queryKey: ["user-form-programmes"],
    queryFn: () => get<ApiResponse<ProgrammeOption[]>>("/programmes/"),
    enabled: open,
    staleTime: 5 * 60_000,
  });
  const departments = (departmentsData?.data ?? []).filter(
    (department) => !facultyId || department.faculty?.id === facultyId
  );
  const programmes = (programmesData?.data ?? []).filter(
    (programme) => !departmentId || programme.department?.id === departmentId
  );

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    setAvatarError(null);
    let avatarFileId: string | undefined;
    if (avatarFile) {
      if (!avatarFile.type.startsWith("image/")) {
        setAvatarError("Profile picture must be an image.");
        return;
      }
      if (avatarFile.size > 5 * 1024 * 1024) {
        setAvatarError("Profile pictures must be 5 MB or smaller.");
        return;
      }
      try {
        avatarFileId = await uploadFile(avatarFile, undefined, "profiles");
      } catch (error) {
        setAvatarError(error instanceof Error ? error.message : "Avatar upload failed.");
        return;
      }
    }
    const payload = {
      email: data.email,
      universityId: data.universityId,
      ...(data.password ? { password: data.password } : {}),
      firstName: data.firstName,
      middleName: data.middleName || undefined,
      lastName: data.lastName,
      phone: data.phone || undefined,
      status: data.status,
      ...(avatarFileId ? { avatarFileId } : {}),
      profileType: data.roleType,
      ...(data.roleType === "student"
        ? {
            matriculeNumber: data.matriculeNumber || undefined,
            currentLevel: data.currentLevel,
            admissionYear: data.admissionYear,
            admissionDate: data.admissionDate || null,
            studentStatus: data.studentStatus,
            programmeId: data.programmeId,
          }
        : {}),
      ...(data.roleType === "staff"
        ? {
            staffNumber: data.staffNumber || undefined,
            departmentId: data.departmentId,
            jobTitle: data.jobTitle || undefined,
          }
        : {}),
    };
    const options = {
      onSuccess: () => {
        setOpen(false);
        reset();
        setAvatarFile(null);
      },
    };
    if (isEditing) {
      update.mutate(payload, options);
    } else {
      create.mutate({ ...payload, password: data.password }, options);
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <>
      <Button
        size="sm"
        variant={isEditing ? "outline" : "primary"}
        onClick={() => setOpen(true)}
      >
        {isEditing ? (
          <>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit user
          </>
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" /> New User
          </>
        )}
      </Button>

      <Dialog
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title={isEditing ? "Edit user" : "New User"}
        description={
          isEditing
            ? "Update the account and its academic or staff profile."
            : "Create a user account. Roles can be assigned afterward."
        }
        size="lg"
        locked={isPending}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
              {isEditing ? "Save changes" : "Create user"}
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

          {isEditing && (
            <div className="border-border/60 rounded-xl border p-3">
              <label className="mb-1.5 block text-sm font-medium">Profile picture</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                className="text-muted-foreground block w-full text-sm"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                JPG, PNG, or WebP up to 5 MB.
              </p>
              {avatarFile && (
                <p className="text-primary mt-1 text-xs">{avatarFile.name} selected</p>
              )}
              {avatarError && <p className="text-danger mt-1 text-xs">{avatarError}</p>}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Password {isEditing ? "(leave blank to keep current)" : <span className="text-danger">*</span>}
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

          {roleType !== "none" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Faculty <span className="text-danger">*</span>
                </label>
                <Select
                  {...register("facultyId", {
                    onChange: () => {
                      setValue("departmentId", "");
                      setValue("programmeId", "");
                    },
                  })}
                  placeholder="Select faculty"
                  options={(facultiesData?.data ?? []).map((faculty) => ({
                    value: faculty.id,
                    label: `${faculty.code} — ${faculty.name}`,
                  }))}
                />
                {errors.facultyId && (
                  <p className="text-danger mt-1 text-xs">{errors.facultyId.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Department <span className="text-danger">*</span>
                </label>
                <Select
                  {...register("departmentId", {
                    onChange: () => setValue("programmeId", ""),
                  })}
                  placeholder="Select department"
                  disabled={!facultyId}
                  options={departments.map((department) => ({
                    value: department.id,
                    label: `${department.code} — ${department.name}`,
                  }))}
                />
                {errors.departmentId && (
                  <p className="text-danger mt-1 text-xs">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>
              {roleType === "student" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Programme <span className="text-danger">*</span>
                  </label>
                  <Select
                    {...register("programmeId")}
                    placeholder="Select programme"
                    disabled={!departmentId}
                    options={programmes.map((programme) => ({
                      value: programme.id,
                      label: `${programme.code} — ${programme.name}`,
                    }))}
                  />
                  {errors.programmeId && (
                    <p className="text-danger mt-1 text-xs">
                      {errors.programmeId.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground flex items-end pb-2 text-xs">
                  Staff placement uses the selected department and its faculty.
                </div>
              )}
            </div>
          )}

          {roleType === "student" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Matricule</label>
                <Input {...register("matriculeNumber")} placeholder="GU-2026-001234" />
                {errors.matriculeNumber && (
                  <p className="text-danger mt-1 text-xs">
                    {errors.matriculeNumber.message}
                  </p>
                )}
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
              <div>
                <label className="mb-1.5 block text-sm font-medium">Admission Date</label>
                <Input type="date" {...register("admissionDate")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Student Status</label>
                <Select
                  {...register("studentStatus")}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "On_LEAVE", label: "On leave" },
                    { value: "SUSPENDED", label: "Suspended" },
                    { value: "GRADUATED", label: "Graduated" },
                    { value: "WITHDRAWN", label: "Withdrawn" },
                  ]}
                />
              </div>
            </div>
          )}

          {roleType === "staff" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Staff Number <span className="text-danger">*</span>
                </label>
                <Input {...register("staffNumber")} placeholder="GU-STAFF-0001" />
                {errors.staffNumber && (
                  <p className="text-danger mt-1 text-xs">{errors.staffNumber.message}</p>
                )}
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
