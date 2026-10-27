import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GU-LMS</span>
        </Link>

        <div className="border-border bg-background rounded-lg border p-6 shadow-sm">
          {children}
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          Gracious University Learning Management System
        </p>
      </div>
    </div>
  );
}
