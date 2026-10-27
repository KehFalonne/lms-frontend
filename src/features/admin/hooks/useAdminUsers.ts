"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  activateUser,
  assignUserRole,
  createUser,
  deactivateUser,
  getUser,
  listUserRoles,
  listUsers,
  revokeUserRole,
  updateUser,
} from "../api/admin.api";
import { normalizeError } from "@/lib/api/errors";
import type { CreateUserPayload } from "../types/admin.types";

export function useAdminUsers(params: {
  page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => listUsers(params),
    staleTime: 30_000,
  });
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => getUser(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUserRoles(id: string | null) {
  return useQuery({
    queryKey: ["admin-user-roles", id],
    queryFn: () => listUserRoles(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("User created");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateUser>[1]) => updateUser(id, payload),
    onSuccess: () => {
      toast.success("User updated");
      qc.invalidateQueries({ queryKey: ["admin-user", id] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      toast.success("User activated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      toast.success("User deactivated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useAssignUserRole(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      roleId: string;
      scopeType?: "GLOBAL" | "FACULTY" | "DEPARTMENT" | "COURSE";
      facultyId?: string;
      departmentId?: string;
      courseOfferingId?: string;
    }) => assignUserRole(userId, payload),
    onSuccess: () => {
      toast.success("Role assigned");
      qc.invalidateQueries({ queryKey: ["admin-user-roles", userId] });
      qc.invalidateQueries({ queryKey: ["admin-user", userId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useRevokeUserRole(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => revokeUserRole(userId, assignmentId),
    onSuccess: () => {
      toast.success("Role revoked");
      qc.invalidateQueries({ queryKey: ["admin-user-roles", userId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
