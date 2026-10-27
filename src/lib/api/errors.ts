import { AxiosError } from "axios";
import type { ApiError } from "@/types/api.types";

export class AppError extends Error {
  statusCode: number;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, statusCode = 500, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosErr = error as AxiosError<ApiError>;
    if (!axiosErr.response) {
      return new AppError("Network error. Check your connection.", 0);
    }
    const status = axiosErr.response.status;
    const payload = axiosErr.response.data;
    return new AppError(
      payload?.message ?? "Something went wrong.",
      status,
      payload?.errors
    );
  }

  if (error instanceof Error) return new AppError(error.message);

  return new AppError("An unexpected error occurred.");
}
