"use client";
import { useQuery } from "@tanstack/react-query";
import { listAuditLogs } from "../api/admin.api";

export function useAuditLogs(params: {
  page?: number;
  action?: string;
  entityType?: string;
  actorId?: string;
}) {
  return useQuery({
    queryKey: ["admin-audit-logs", params],
    queryFn: () => listAuditLogs(params),
    staleTime: 15_000,
  });
}
