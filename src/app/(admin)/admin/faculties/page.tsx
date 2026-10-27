"use client";
import { Building2 } from "lucide-react";
import { AuthGate } from "@/components/layout/auth-gate";
import { Badge } from "@/components/ui/badge";
import { ResourceTable } from "@/features/admin/components/resource-table";
import { ADMIN_ROLES } from "@/lib/constants/routes";

interface Faculty {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
}

export default function FacultiesPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <ResourceTable<Faculty>
        title="Faculties"
        description="University faculties."
        endpoint="/faculties/"
        queryKey="admin-faculties"
        emptyIcon={Building2}
        columns={[
          { key: "code", header: "Code", render: (r) => <strong>{r.code}</strong> },
          { key: "name", header: "Name", render: (r) => r.name },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge variant={r.status === "ACTIVE" ? "success" : "default"}>
                {r.status}
              </Badge>
            ),
          },
        ]}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "name", label: "Name", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
        ]}
      />
    </AuthGate>
  );
}
