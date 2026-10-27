"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createRole,
  deleteRole,
  getRole,
  getRolePermissions,
  listPermissions,
  listRoles,
  setRolePermissions,
  updateRole,
} from "../api/admin.api";
import { normalizeError } from "@/lib/api/errors";

export function useRoles() {
  return useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => listRoles(),
    staleTime: 60_000,
  });
}

export function useRole(id: string | null) {
  return useQuery({
    queryKey: ["admin-role", id],
    queryFn: () => getRole(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ["admin-role-permissions", roleId],
    queryFn: () => getRolePermissions(roleId!),
    enabled: !!roleId,
    staleTime: 30_000,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () => listPermissions({ pageSize: 500 }),
    staleTime: 5 * 60_000,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("Role created");
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateRole>[1]) => updateRole(id, payload),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-role", id] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Role deleted");
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useSetRolePermissions(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds: string[]) => setRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      toast.success("Permissions updated");
      qc.invalidateQueries({
        queryKey: ["admin-role-permissions", roleId],
      });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
