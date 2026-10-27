"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types/auth.types";

export type AuthStatus = "unknown" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "unknown",
      setUser: (user) =>
        set({
          user,
          status: user ? "authenticated" : "unauthenticated",
        }),
      setStatus: (status) => set({ status }),
      clear: () => set({ user: null, status: "unauthenticated" }),
    }),
    {
      name: "gu-lms-auth",
      // Only persist the user — status must reset on reload so loadSession
      // can verify the token is still valid.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        // After hydration, mark status as unknown so loadSession() re-fetches
        // from the backend and validates the token.
        state?.setStatus("unknown");
      },
    }
  )
);
