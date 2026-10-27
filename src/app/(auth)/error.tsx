"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[auth-error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="bg-warning/10 mb-3 flex h-10 w-10 items-center justify-center rounded-full">
        <AlertTriangle className="text-warning h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {error.message || "Please try again."}
      </p>
      <div className="mt-5 flex gap-2">
        <Button onClick={reset} size="sm">
          Retry
        </Button>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
