"use client";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedParams } from "@/types/api.types";
import { getAuditFacets, listAuditLogs } from "../api/admin.api";

export interface AuditLogParams extends PaginatedParams {
  action?: string;
  entityType?: string;
  actorId?: string;
  actor?: string;
  entityId?: string;
  createdFrom?: string;
  createdTo?: string;
}

export function useAuditLogs(params: AuditLogParams) {
  return useQuery({
    queryKey: ["admin-audit-logs", params],
    queryFn: () => listAuditLogs(params),
    staleTime: 15_000,
  });
}

export function useAuditFacets() {
  return useQuery({
    queryKey: ["admin-audit-facets"],
    queryFn: getAuditFacets,
    staleTime: 60_000,
  });
}
