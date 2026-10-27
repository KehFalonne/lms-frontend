"use client";
import { useEffect } from "react";
import Link from "next/link";
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
      router.replace(roleBasedLanding(user.roles));
    }
  }, [isAuthenticated, user, router]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in to continue to your dashboard.
        </p>
      </div>

      <LoginForm />

      <div className="mt-5 text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot your password?
        </Link>
      </div>
    </>
  );
}
