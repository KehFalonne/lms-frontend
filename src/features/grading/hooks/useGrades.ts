"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getGradeCategories,
  getGradebook,
  getMyCourseGrades,
  getMyGrades,
  publishAllGrades,
  publishGradeItem,
  setCategoryWeights,
  setGrade,
} from "../api/grading.api";
import { normalizeError } from "@/lib/api/errors";
import type { CategoryWeightInput } from "../types/grading.types";

// ── Student hooks ─────────────────────────────────────────────────

export function useMyGrades() {
  return useQuery({
    queryKey: ["my-grades"],
    queryFn: getMyGrades,
    staleTime: 60_000,
  });
}

export function useMyCourseGrades(offeringId: string | null) {
  return useQuery({
    queryKey: ["my-course-grades", offeringId],
    queryFn: () => getMyCourseGrades(offeringId!),
    enabled: !!offeringId,
    staleTime: 60_000,
  });
}

// ── Lecturer hooks ────────────────────────────────────────────────

export function useGradebook(offeringId: string | null) {
  return useQuery({
    queryKey: ["gradebook", offeringId],
    queryFn: () => getGradebook(offeringId!),
    enabled: !!offeringId,
    staleTime: 15_000,
  });
}

export function useGradeCategories(offeringId: string | null) {
  return useQuery({
    queryKey: ["grade-categories", offeringId],
    queryFn: () => getGradeCategories(offeringId!),
    enabled: !!offeringId,
    staleTime: 60_000,
  });
}

export function useSetGrade(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      gradeItemId,
      studentId,
      score,
      feedback,
    }: {
      gradeItemId: string;
      studentId: string;
      score: string | null;
      feedback?: string;
    }) => setGrade(gradeItemId, studentId, { score, feedback }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gradebook", offeringId] });
      qc.invalidateQueries({ queryKey: ["my-course-grades"] });
      qc.invalidateQueries({ queryKey: ["my-grades"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function usePublishGradeItem(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gradeItemId: string) => publishGradeItem(gradeItemId),
    onSuccess: (res) => {
      toast.success(`${res.data.published} grade(s) published`);
      qc.invalidateQueries({ queryKey: ["gradebook", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function usePublishAllGrades(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => publishAllGrades(offeringId),
    onSuccess: (res) => {
      toast.success(`${res.data.published} grade(s) published`);
      qc.invalidateQueries({ queryKey: ["gradebook", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useSetCategoryWeights(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weights: CategoryWeightInput[]) =>
      setCategoryWeights(offeringId, weights),
    onSuccess: () => {
      toast.success("Category weights saved");
      qc.invalidateQueries({ queryKey: ["grade-categories", offeringId] });
      qc.invalidateQueries({ queryKey: ["gradebook", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
