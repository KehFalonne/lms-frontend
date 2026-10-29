"use client";
import { useState } from "react";
import { Flag } from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ResolveAppealDialog } from "@/features/grading/components/resolve-appeal-dialog";
import { useAppealQueue } from "@/features/grading/hooks/useAppeals";
import { LECTURER_ROLES } from "@/lib/constants/routes";
import { relativeTime } from "@/lib/utils/format";
import type { GradeAppeal } from "@/features/grading/types/grading.types";

export default function LecturerAppealsPage() {
  return (
    <AuthGate requiredRoles={LECTURER_ROLES}>
      <AppealsContent />
    </AuthGate>
  );
}

function AppealsContent() {
  const [status, setStatus] = useState("ACTIVE");
  const { data, isLoading, isError, refetch } = useAppealQueue({ status, mine: true });
  const [selected, setSelected] = useState<GradeAppeal | null>(null);

  const appeals = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Grade Appeals"
        description="Student appeals awaiting your review."
        actions={
          <div className="border-border flex items-center gap-1 rounded-md border p-0.5">
            {["ACTIVE", "APPROVED", "DENIED", "ALL"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded px-3 py-1 text-sm ${
                  status === s ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {s === "ACTIVE" ? "Active" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && appeals.length === 0 && (
        <EmptyState
          icon={Flag}
          title="No appeals"
          description="No student appeals match your filter."
        />
      )}

      {!isLoading && !isError && appeals.length > 0 && (
        <div className="space-y-2">
          {appeals.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        a.status === "PENDING"
                          ? "warning"
                          : a.status === "UNDER_REVIEW"
                            ? "info"
                            : a.status === "APPROVED"
                              ? "success"
                              : a.status === "DENIED"
                                ? "danger"
                                : "default"
                      }
                    >
                      {a.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {a.student.firstName} {a.student.lastName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {a.student.universityId}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {a.gradeItemName} — score {a.originalScore ?? "—"}/{a.maxScore}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm">{a.reason}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Submitted {relativeTime(a.createdAt)}
                  </p>
                </div>

                {(a.status === "PENDING" || a.status === "UNDER_REVIEW") && (
                  <Button size="sm" onClick={() => setSelected(a)}>
                    Review
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ResolveAppealDialog appeal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
