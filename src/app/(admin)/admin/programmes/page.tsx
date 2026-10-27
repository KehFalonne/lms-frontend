"use client";
import { BookMarked } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/layout/auth-gate";
import { ResourceTable } from "@/features/admin/components/resource-table";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { ADMIN_ROLES } from "@/lib/constants/routes";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Programme {
  id: string;
  code: string;
  name: string;
  degreeType: string;
  durationYears: number;
  department: { id: string; code: string; name: string } | null;
}

export default function ProgrammesPage() {
  const { data } = useQuery({
    queryKey: ["dept-options"],
    queryFn: () => get<ApiResponse<Department[]>>("/departments/"),
  });
  const departmentOptions =
    data?.data.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` })) ?? [];

  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <ResourceTable<Programme>
        title="Programmes"
        description="Degree programmes."
        endpoint="/programmes/"
        queryKey="admin-programmes"
        emptyIcon={BookMarked}
        columns={[
          { key: "code", header: "Code", render: (r) => <strong>{r.code}</strong> },
          { key: "name", header: "Name", render: (r) => r.name },
          { key: "degreeType", header: "Type", render: (r) => r.degreeType },
          { key: "durationYears", header: "Years", render: (r) => r.durationYears },
        ]}
        fields={[
          {
            name: "departmentId",
            label: "Department",
            type: "select",
            options: departmentOptions,
            required: true,
          },
          { name: "code", label: "Code", type: "text", required: true },
          { name: "name", label: "Name", type: "text", required: true },
          {
            name: "degreeType",
            label: "Degree Type",
            type: "select",
            required: true,
            defaultValue: "BSC",
            options: [
              { value: "BSC", label: "BSc" },
              { value: "BA", label: "BA" },
              { value: "BTECH", label: "BTech" },
              { value: "MSC", label: "MSc" },
              { value: "MA", label: "MA" },
              { value: "MBA", label: "MBA" },
              { value: "PHD", label: "PhD" },
              { value: "DIPLOMA", label: "Diploma" },
            ],
          },
          {
            name: "durationYears",
            label: "Duration (years)",
            type: "number",
            required: true,
            defaultValue: "4",
          },
        ]}
      />
    </AuthGate>
  );
}
