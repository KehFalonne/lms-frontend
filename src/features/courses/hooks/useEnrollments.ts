"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { normalizeError } from "@/lib/api/errors";
import {
  bulkEnrollOfferingStudents,
  decideOfferingEnrollment,
  enrollOfferingStudent,
  getOfferingEnrollments,
  removeOfferingEnrollment,
} from "../api/courses.api";
import type {
  BulkEnrollPayload,
  EnrollmentDecisionPayload,
  EnrollStudentPayload,
} from "../types/course.types";

export function useOfferingEnrollments(offeringId: string | null | undefined) {
  return useQuery({
    queryKey: ["offering-enrollments", offeringId],
    queryFn: () => (offeringId ? getOfferingEnrollments(offeringId) : null),
    enabled: !!offeringId,
    staleTime: 15_000,
  });
}

export function useEnrollStudent(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EnrollStudentPayload) =>
      enrollOfferingStudent(offeringId, payload),
    onSuccess: () => {
      toast.success("Student enrolled successfully.");
      qc.invalidateQueries({ queryKey: ["offering-enrollments", offeringId] });
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course-offering", offeringId] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to enroll student.");
    },
  });
}

export function useBulkEnrollStudents(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkEnrollPayload) =>
      bulkEnrollOfferingStudents(offeringId, payload),
    onSuccess: (res) => {
      const created = res?.data?.created ?? 0;
      const skipped = res?.data?.skipped ?? 0;
      toast.success(
        `${created} students enrolled successfully${
          skipped > 0 ? ` (${skipped} skipped or already enrolled)` : ""
        }.`
      );
      qc.invalidateQueries({ queryKey: ["offering-enrollments", offeringId] });
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course-offering", offeringId] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to bulk enroll students.");
    },
  });
}

export function useRemoveEnrollment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => removeOfferingEnrollment(offeringId, studentId),
    onSuccess: () => {
      toast.success("Enrollment removed.");
      qc.invalidateQueries({ queryKey: ["offering-enrollments", offeringId] });
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course-offering", offeringId] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to remove enrollment.");
    },
  });
}

export function useDecideEnrollment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: EnrollmentDecisionPayload;
    }) => decideOfferingEnrollment(offeringId, studentId, payload),
    onSuccess: (_, vars) => {
      toast.success(
        vars.payload.status === "ACTIVE"
          ? "Enrollment approved."
          : "Enrollment request rejected."
      );
      qc.invalidateQueries({ queryKey: ["offering-enrollments", offeringId] });
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course-offering", offeringId] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to update enrollment status.");
    },
  });
}

