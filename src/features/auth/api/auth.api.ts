import { get, post } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
} from "../types/auth.types";

export async function login(payload: LoginRequest) {
  return post<ApiResponse<LoginResponse>>(endpoints.auth.login, payload);
}

export async function me() {
  return get<ApiResponse<AuthUser>>(endpoints.auth.me);
}

export async function logout(refresh: string) {
  return post<ApiResponse<unknown>>(endpoints.auth.logout, { refresh });
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  return post<ApiResponse<unknown>>(endpoints.auth.forgotPassword, payload);
}

export async function resetPassword(payload: ResetPasswordRequest) {
  return post<ApiResponse<unknown>>(endpoints.auth.resetPassword, payload);
}
