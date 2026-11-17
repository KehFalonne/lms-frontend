"use client";
import Link from "next/link";
import { BookOpen, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/layout/auth-gate";
import { Button } from "@/components/ui/button";
import { ResourceTable } from "@/features/admin/components/resource-table";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { ADMIN_ROLES } from "@/lib/constants/routes";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  level: number;
  department: { id: string; code: string; name: string } | null;
}

export default function CoursesPage() {
  const { data } = useQuery({
    queryKey: ["dept-options-courses"],
    queryFn: () => get<ApiResponse<Department[]>>("/departments/"),
  });
  const departmentOptions =
    data?.data.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` })) ?? [];

  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <div className="border-primary/20 bg-primary/5 mb-4 flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-primary font-semibold">
            Manage Course Delivery & Instructors
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            This catalog defines base courses. To schedule semester offerings, section
            capacities, and assign teaching staff, use Course Offerings.
          </p>
        </div>
        <Link href="/admin/course-offerings">
          <Button size="sm">
            <Layers className="mr-1.5 h-4 w-4" />
            Course Offerings & Staffing
          </Button>
        </Link>
      </div>

      <ResourceTable<Course>
        title="Courses"
        description="Course catalogue."
        endpoint="/courses/"
        queryKey="admin-courses"
        emptyIcon={BookOpen}
        columns={[
          { key: "code", header: "Code", render: (r) => <strong>{r.code}</strong> },
          { key: "title", header: "Title", render: (r) => r.title },
          { key: "credits", header: "Credits", render: (r) => r.credits },
          { key: "level", header: "Level", render: (r) => r.level },
        ]}
        fields={[
          {
            name: "departmentId",
            label: "Department",
            type: "select",
            options: departmentOptions,
            required: true,
          },
          { name: "code", label: "Course Code", type: "text", required: true },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          {
            name: "credits",
            label: "Credits",
            type: "number",
            required: true,
            defaultValue: "3",
          },
          {
            name: "level",
            label: "Level",
            type: "number",
            required: true,
            defaultValue: "100",
          },
        ]}
      />
    </AuthGate>
  );
}
