"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type { AssignmentDetail } from "../types/assignment.types";
import {
  getAssignment,
  getMyAssignments,
  getMySubmission,
  submitAssignment,
  type SubmitAssignmentPayload,
} from "../api/assignments.api";
import { normalizeError } from "@/lib/api/errors";

export function useMyAssignments() {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
    staleTime: 30_000,
  });
}

export function useAssignment(id: string | null) {
  return useQuery({
    queryKey: ["assignment", id],
    queryFn: () => getAssignment(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useMySubmission(assignmentId: string | null) {
  return useQuery({
    queryKey: ["my-submission", assignmentId],
    queryFn: () => getMySubmission(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 30_000,
  });
}

export function useSubmitAssignment(assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitAssignmentPayload) =>
      submitAssignment(assignmentId, payload),
    onSuccess: () => {
      toast.success("Assignment submitted");
      qc.invalidateQueries({ queryKey: ["my-submission", assignmentId] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message);
    },
  });
}

import {
  closeAssignment as closeAssignmentApi,
  createAssignment,
  getSubmissions,
  gradeSubmission,
  publishAssignment as publishAssignmentApi,
  updateAssignment,
  type CreateAssignmentPayload,
  type GradeSubmissionPayload,
} from "../api/assignments.api";

export function useCourseAssignments(offeringId: string | null) {
  return useQuery({
    queryKey: ["course-assignments", offeringId],
    queryFn: () =>
      get<ApiResponse<import("../types/assignment.types").AssignmentDetail[]>>(
        `/course-offerings/${offeringId}/assignments/`
      ),
    enabled: !!offeringId,
    staleTime: 30_000,
  });
}

export function useSubmissions(assignmentId: string | null) {
  return useQuery({
    queryKey: ["submissions", assignmentId],
    queryFn: () => getSubmissions(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 15_000,
  });
}

export function useCreateAssignment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) =>
      createAssignment(offeringId, payload),
    onSuccess: () => {
      toast.success("Assignment created");
      qc.invalidateQueries({ queryKey: ["course-assignments", offeringId] });
      qc.invalidateQueries({ queryKey: ["my-teaching-courses"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function usePublishAssignment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishAssignmentApi(id),
    onSuccess: () => {
      toast.success("Assignment published");
      qc.invalidateQueries({ queryKey: ["course-assignments", offeringId] });
      qc.invalidateQueries({ queryKey: ["lecturer-dashboard"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useCloseAssignment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeAssignmentApi(id),
    onSuccess: () => {
      toast.success("Assignment closed");
      qc.invalidateQueries({ queryKey: ["course-assignments", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useGradeSubmission(assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: GradeSubmissionPayload;
    }) => gradeSubmission(submissionId, payload),
    onSuccess: () => {
      toast.success("Grade saved");
      qc.invalidateQueries({ queryKey: ["submissions", assignmentId] });
      qc.invalidateQueries({ queryKey: ["lecturer-dashboard"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
