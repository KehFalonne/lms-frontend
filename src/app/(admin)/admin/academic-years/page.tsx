"use client";
import { Calendar, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { ResourceTable } from "@/features/admin/components/resource-table";
import { post } from "@/lib/api/client";
import { normalizeError } from "@/lib/api/errors";
import { ADMIN_ROLES } from "@/lib/constants/routes";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  isCurrent: boolean;
}

export default function AcademicYearsPage() {
  const qc = useQueryClient();
  const setCurrent = useMutation({
    mutationFn: (id: string) => post(`/academic-years/${id}/set-current/`),
    onSuccess: () => {
      toast.success("Now current");
      qc.invalidateQueries({ queryKey: ["admin-academic-years"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <ResourceTable<AcademicYear>
        title="Academic Years"
        description="Academic sessions."
        endpoint="/academic-years/"
        queryKey="admin-academic-years"
        emptyIcon={Calendar}
        columns={[
          { key: "name", header: "Name", render: (r) => <strong>{r.name}</strong> },
          { key: "startDate", header: "Start", render: (r) => r.startDate },
          { key: "endDate", header: "End", render: (r) => r.endDate },
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
          { name: "name", label: "Name (e.g. 2027/2028)", type: "text", required: true },
          { name: "startDate", label: "Start date", type: "date", required: true },
          { name: "endDate", label: "End date", type: "date", required: true },
        ]}
      />
    </AuthGate>
  );
}
