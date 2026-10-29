"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createAppeal,
  getAppealQueue,
  resolveAppeal,
  withdrawAppeal,
} from "../api/grading.api";
import { normalizeError } from "@/lib/api/errors";

export function useAppealQueue(params: { status?: string; mine?: boolean }) {
  return useQuery({
    queryKey: ["appeal-queue", params],
    queryFn: () => getAppealQueue(params),
    staleTime: 15_000,
  });
}

export function useCreateAppeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeId, reason }: { gradeId: string; reason: string }) =>
      createAppeal(gradeId, reason),
    onSuccess: () => {
      toast.success("Appeal submitted");
      qc.invalidateQueries({ queryKey: ["my-grades"] });
      qc.invalidateQueries({ queryKey: ["my-course-grades"] });
      qc.invalidateQueries({ queryKey: ["appeal-queue"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useResolveAppeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      appealId,
      payload,
    }: {
      appealId: string;
      payload: Parameters<typeof resolveAppeal>[1];
    }) => resolveAppeal(appealId, payload),
    onSuccess: () => {
      toast.success("Appeal resolved");
      qc.invalidateQueries({ queryKey: ["appeal-queue"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useWithdrawAppeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appealId: string) => withdrawAppeal(appealId),
    onSuccess: () => {
      toast.success("Appeal withdrawn");
      qc.invalidateQueries({ queryKey: ["my-grades"] });
      qc.invalidateQueries({ queryKey: ["appeal-queue"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
