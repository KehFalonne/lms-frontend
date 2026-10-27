"use client";
import { Settings as SettingsIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { get } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import { ADMIN_ROLES } from "@/lib/constants/routes";
import { useAuthStore } from "@/stores/auth.store";

export default function SettingsPage() {
  return (
    <AuthGate requiredRoles={ADMIN_ROLES}>
      <SettingsContent />
    </AuthGate>
  );
}

function SettingsContent() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Read-only view of current platform configuration."
      />

      <div className="border-warning/30 bg-warning/10 mb-4 rounded-md border p-4 text-sm">
        <p>
          Settings are read from environment variables on the backend. Editing them from
          the UI requires a dedicated settings API — planned but not yet implemented.
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Current Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="University ID" value={user?.universityId ?? "—"} />
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Name" value={user ? `${user.firstName} ${user.lastName}` : "—"} />
          <Row label="Roles" value={user?.roles.join(", ") || "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Info</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={SettingsIcon}
            title="Configurable settings coming soon"
            description="Institution name, storage, email, security policies — all configurable via .env for now."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex justify-between border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
