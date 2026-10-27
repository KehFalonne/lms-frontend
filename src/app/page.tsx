"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { roleBasedLanding } from "@/lib/constants/routes";

export default function HomePage() {
  const { status, isAuthenticated, user, loadSession } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "unknown") loadSession();
  }, [status, loadSession]);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(roleBasedLanding(user.roles));
    }
  }, [isAuthenticated, user, router]);

  return (
    <main className="bg-surface flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="bg-primary text-primary-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">GU-LMS</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gracious University Learning Management System
          </p>

          <div className="mt-8 flex w-full flex-col gap-2">
            {isAuthenticated ? (
              <Link href={roleBasedLanding(user?.roles ?? [])}>
                <Button className="w-full">Go to dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="w-full">Sign in</Button>
              </Link>
            )}
            <a
              href="http://localhost:8000/api/docs/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              View API documentation →
            </a>
          </div>

          <p className="text-muted-foreground mt-8 text-[11px]">
            Sprint 2 · Auth + Dashboard shell
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
