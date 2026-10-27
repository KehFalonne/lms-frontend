"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";
import { normalizeError } from "@/lib/api/errors";
import { roleBasedLanding } from "@/lib/constants/routes";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    try {
      const user = await login(values);
      router.push(roleBasedLanding(user.roles));
    } catch (err) {
      setServerError(normalizeError(err).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium">
          University ID, Matricule, or Email
        </label>
        <Input
          id="identifier"
          autoComplete="username"
          placeholder="GU2026001"
          {...register("identifier")}
          aria-invalid={!!errors.identifier}
        />
        {errors.identifier && (
          <p className="text-danger mt-1 text-sm">{errors.identifier.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-danger mt-1 text-sm">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        <LogIn className="h-4 w-4" />
        Sign in
      </Button>
    </form>
  );
}
