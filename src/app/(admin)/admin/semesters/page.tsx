"use client";
import { Calendar, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { ResourceTable } from "@/features/admin/components/resource-table";
import { get, post } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import { normalizeError } from "@/lib/api/errors";
import { ADMIN_ROLES } from "@/lib/constants/routes";

interface AcademicYear {
  id: string;
  name: string;
}

interface Semester {
  id: string;
  name: string;
  code: string;
  sequence: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  academicYear: { id: string; name: string } | null;
}

export default function SemestersPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["year-options"],
    queryFn: () => get<ApiResponse<AcademicYear[]>>("/academic-years/"),
  });
  const yearOptions = data?.data.map((y) => ({ value: y.id, label: y.name })) ?? [];

  const setCurrent = useMutation({
    mutationFn: (id: string) => post(`/semesters/${id}/set-current/`),
    onSuccess: () => {
      toast.success("Now current");
      qc.invalidateQueries({ queryKey: ["admin-semesters"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <ResourceTable<Semester>
        title="Semesters"
        description="Semesters within academic years."
        endpoint="/semesters/"
        queryKey="admin-semesters"
        emptyIcon={Calendar}
        columns={[
          { key: "name", header: "Name", render: (r) => <strong>{r.name}</strong> },
          { key: "code", header: "Code", render: (r) => r.code },
          {
            key: "academicYear",
            header: "Year",
            render: (r) => r.academicYear?.name ?? "—",
          },
          {
            key: "isCurrent",
            header: "Current",
            render: (r) =>
              r.isCurrent ? (
                <Badge variant="success">
                  <Star className="mr-1 h-3 w-3" /> Current
                </Badge>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              ),
          },
        ]}
        rowActions={[
          {
            label: "Set current",
            onClick: (r) => setCurrent.mutate(r.id),
            disabled: (r) => r.isCurrent,
          },
        ]}
        fields={[
          {
            name: "academicYearId",
            label: "Academic Year",
            type: "select",
            options: yearOptions,
            required: true,
          },
          { name: "name", label: "Name", type: "text", required: true },
          { name: "code", label: "Code (S1/S2)", type: "text", required: true },
          {
            name: "sequence",
            label: "Sequence (1/2)",
            type: "number",
            required: true,
            defaultValue: "1",
          },
          { name: "startDate", label: "Start date", type: "date", required: true },
          { name: "endDate", label: "End date", type: "date", required: true },
        ]}
      />
    </AuthGate>
  );
}
