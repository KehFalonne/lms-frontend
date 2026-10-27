"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { roleBasedLanding } from "@/lib/constants/routes";

interface AuthGateProps {
  children: React.ReactNode;
  requiredRoles?: readonly string[];
}

export function AuthGate({ children, requiredRoles }: AuthGateProps) {
  const router = useRouter();
  const { user, status, isAuthenticated, loadSession } = useAuth();

  useEffect(() => {
    if (status === "unknown") loadSession();
  }, [status, loadSession]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const hasRequiredRole =
    !requiredRoles ||
    (user && requiredRoles.some((r) => user.roles.some((role) => role === r)));

  useEffect(() => {
    if (isAuthenticated && user && requiredRoles && !hasRequiredRole) {
      // Wrong role — send to their correct home
      router.replace(roleBasedLanding(user.roles));
    }
  }, [isAuthenticated, user, requiredRoles, hasRequiredRole, router]);

  if (status === "unknown" || status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-3 text-sm">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
          Loading session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (requiredRoles && !hasRequiredRole) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-2 text-center text-sm">
          <ShieldAlert className="text-warning h-8 w-8" />
          <p>You don't have access to this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
