"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/auth.schema";
import { forgotPassword } from "../api/auth.api";
import { normalizeError } from "@/lib/api/errors";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setServerError(null);
    try {
      await forgotPassword(values);
      setSent(true);
    } catch (err) {
      setServerError(normalizeError(err).message);
    }
  };

  if (sent) {
    return (
      <div className="border-success/30 bg-success/10 rounded-md border p-4 text-sm">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" />
          <p>
            If an account exists with that email, a reset link has been sent. Check your
            inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@graciousuniversity.edu"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-danger mt-1 text-sm">{errors.email.message}</p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger rounded-md border px-3 py-2 text-sm"
        >
          {serverError}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
