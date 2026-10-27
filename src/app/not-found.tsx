"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Compass, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { roleBasedLanding } from "@/lib/constants/routes";

export default function NotFound() {
  const { user, status, loadSession } = useAuth();

  useEffect(() => {
    if (status === "unknown") loadSession();
  }, [status, loadSession]);

  // While the session is resolving, show a loader so we don't flash the
  // "Go to sign in" label before we know who the user is.
  if (status === "unknown" || status === "loading") {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  const isAuthenticated = status === "authenticated" && !!user;
  const homeHref = isAuthenticated ? roleBasedLanding(user.roles) : "/login";
  const homeLabel = isAuthenticated ? "Go to dashboard" : "Go to sign in";

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Compass className="text-primary h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Page not found</h1>
          <p className="text-muted-foreground mt-2 max-w-xs text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href={homeHref} className="mt-6 w-full">
            <Button className="w-full">{homeLabel}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
