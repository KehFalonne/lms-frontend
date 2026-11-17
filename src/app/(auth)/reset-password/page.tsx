import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-muted-foreground mt-1.5 text-sm leading-6">
          Choose a new password for your account. Links expire shortly for your security.
        </p>
      </div>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-5 text-center text-sm">
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </>
  );
}
