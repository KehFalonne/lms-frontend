import { del, get, patch, post, put } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginatedParams } from "@/types/api.types";
import type {
  AdminStats,
  AdminUser,
  AdminUserRoleAssignment,
  AuditLog,
  CreateUserPayload,
  Permission,
  Role,
} from "../types/admin.types";

// ── Users ─────────────────────────────────────────────────────────

export async function listUsers(params?: PaginatedParams & { status?: string }) {
  return get<ApiResponse<AdminUser[]>>(endpoints.users.list, { params });
}

export async function getUser(id: string) {
  return get<ApiResponse<AdminUser>>(endpoints.users.detail(id));
}

export async function createUser(payload: CreateUserPayload) {
  return post<ApiResponse<AdminUser>>(endpoints.users.list, payload);
}

export async function updateUser(id: string, payload: Partial<AdminUser>) {
  return patch<ApiResponse<AdminUser>>(endpoints.users.detail(id), payload);
}

export async function activateUser(id: string) {
  return post<ApiResponse<AdminUser>>(endpoints.users.activate(id));
}

export async function deactivateUser(id: string) {
  return post<ApiResponse<AdminUser>>(endpoints.users.deactivate(id));
}

export async function listUserRoles(id: string) {
  return get<ApiResponse<AdminUserRoleAssignment[]>>(`/users/${id}/roles/`);
}

export async function assignUserRole(
  userId: string,
  payload: {
    roleId: string;
    scopeType?: "GLOBAL" | "FACULTY" | "DEPARTMENT" | "COURSE";
    facultyId?: string;
    departmentId?: string;
    courseOfferingId?: string;
  }
) {
  return post<ApiResponse<AdminUserRoleAssignment>>(
    endpoints.users.assignRole(userId),
    payload
  );
}

export async function revokeUserRole(userId: string, assignmentId: string) {
  return del(endpoints.users.revokeRole(userId, assignmentId));
}

// ── Roles & permissions ───────────────────────────────────────────

export async function listRoles(params?: PaginatedParams) {
  return get<ApiResponse<Role[]>>(endpoints.roles.list, { params });
}

export async function getRole(id: string) {
  return get<ApiResponse<Role>>(endpoints.roles.detail(id));
}

export async function createRole(payload: {
  code: string;
  name: string;
  description?: string;
}) {
  return post<ApiResponse<Role>>(endpoints.roles.list, payload);
}

export async function updateRole(id: string, payload: Partial<Role>) {
  return patch<ApiResponse<Role>>(endpoints.roles.detail(id), payload);
}

export async function deleteRole(id: string) {
  return del(endpoints.roles.detail(id));
}

export async function listPermissions(params?: PaginatedParams) {
  return get<ApiResponse<Permission[]>>(endpoints.permissions, { params });
}

export async function getRolePermissions(roleId: string) {
  return get<ApiResponse<Permission[]>>(endpoints.roles.permissions(roleId));
}

export async function setRolePermissions(roleId: string, permissionIds: string[]) {
  return put<ApiResponse<Permission[]>>(endpoints.roles.permissions(roleId), {
    permissionIds,
  });
}

// ── Audit logs ────────────────────────────────────────────────────

export async function listAuditLogs(
  params?: PaginatedParams & {
    action?: string;
    entityType?: string;
    actorId?: string;
  }
) {
  return get<ApiResponse<AuditLog[]>>(endpoints.audit.logs, { params });
}

// ── Stats ─────────────────────────────────────────────────────────

export async function getAdminStats() {
  return get<ApiResponse<AdminStats>>(endpoints.analytics.adminStats);
}
