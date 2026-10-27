"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth.store";
import { clearTokens, hasTokens, storeTokens } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import * as authApi from "../api/auth.api";
import type { AuthUser } from "../types/auth.types";
import type { LoginInput } from "../schemas/auth.schema";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const clear = useAuthStore((s) => s.clear);

  const loadSession = useCallback(async () => {
    if (!hasTokens()) {
      setStatus("unauthenticated");
      return;
    }
    setStatus("loading");
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      clearTokens();
      clear();
    }
  }, [setUser, setStatus, clear]);

  const login = useCallback(
    async (input: LoginInput): Promise<AuthUser> => {
      const res = await authApi.login(input);
      storeTokens(res.data.access, res.data.refresh);

      // Enrich with full profile (permissions, roles, profiles)
      const meRes = await authApi.me();
      setUser(meRes.data);
      return meRes.data;
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    const refresh =
      typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Ignore — session is dead either way
    } finally {
      clearTokens();
      clear();
      queryClient.clear();
      router.push("/login");
    }
  }, [clear, queryClient, router]);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || status === "unknown",
    login,
    logout,
    loadSession,
  };
}

// Re-export for convenience
export { endpoints as authEndpoints };
