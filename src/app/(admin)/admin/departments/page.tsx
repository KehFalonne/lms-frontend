"use client";
import { School } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/layout/auth-gate";
import { ResourceTable } from "@/features/admin/components/resource-table";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { ADMIN_ROLES } from "@/lib/constants/routes";

interface Faculty {
  id: string;
  code: string;
  name: string;
}

interface Department {
  id: string;
  code: string;
  name: string;
  faculty: { id: string; code: string; name: string } | null;
  status: string;
}

export default function DepartmentsPage() {
  const { data: facultiesData } = useQuery({
    queryKey: ["faculty-options"],
    queryFn: () => get<ApiResponse<Faculty[]>>("/faculties/"),
  });
  const facultyOptions =
    facultiesData?.data.map((f) => ({
      value: f.id,
      label: `${f.code} — ${f.name}`,
    })) ?? [];

  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <ResourceTable<Department>
        title="Departments"
        description="Departments within each faculty."
        endpoint="/departments/"
        queryKey="admin-departments"
        emptyIcon={School}
        columns={[
          { key: "code", header: "Code", render: (r) => <strong>{r.code}</strong> },
          { key: "name", header: "Name", render: (r) => r.name },
          {
            key: "faculty",
            header: "Faculty",
            render: (r) => r.faculty?.name ?? "—",
          },
        ]}
        fields={[
          {
            name: "facultyId",
            label: "Faculty",
            type: "select",
            options: facultyOptions,
            required: true,
          },
          { name: "code", label: "Code", type: "text", required: true },
          { name: "name", label: "Name", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
        ]}
      />
    </AuthGate>
  );
}
