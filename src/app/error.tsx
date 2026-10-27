"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="bg-warning/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-warning h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground mt-2 max-w-xs text-sm">
            We hit an unexpected error. You can retry, or go back to the dashboard.
          </p>
          {error.digest && (
            <p className="text-muted-foreground mt-2 font-mono text-[10px]">
              ref: {error.digest}
            </p>
          )}
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button onClick={reset}>Try again</Button>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Go to dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
