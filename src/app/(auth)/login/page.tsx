"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { roleBasedLanding } from "@/lib/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const { user, status, isAuthenticated, loadSession } = useAuth();

  useEffect(() => {
    if (status === "unknown") loadSession();
  }, [status, loadSession]);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(
        roleBasedLanding(
          user.roles,
          Boolean(user.staffProfile),
          Boolean(user.studentProfile),
          Boolean(user.isStaff)
        )
      );
    }
  }, [isAuthenticated, user, router]);

  return (
    <>
      <div className="mb-6 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm leading-6">
          Sign in with your university ID, matricule, or email to pick up right where you
          left off.
        </p>
      </div>

      <LoginForm />
    </>
  );
}
