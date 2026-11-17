import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { normalizeError } from "@/lib/api/errors";
import {
  archiveCourseOffering,
  assignOfferingInstructor,
  cancelCourseOffering,
  completeCourseOffering,
  createCourseOffering,
  deleteCourseOffering,
  getCourseOffering,
  getCourseOfferings,
  getOfferingInstructors,
  publishCourseOffering,
  removeOfferingInstructor,
  updateCourseOffering,
  updateOfferingInstructor,
} from "../api/courses.api";
import type {
  AssignInstructorPayload,
  CreateCourseOfferingPayload,
  UpdateInstructorPayload,
} from "../types/course.types";

export function useCourseOfferings(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["course-offerings", params],
    queryFn: () => getCourseOfferings(params),
    staleTime: 30_000,
  });
}

export function useCourseOffering(offeringId: string | null | undefined) {
  return useQuery({
    queryKey: ["course-offering", offeringId],
    queryFn: () => (offeringId ? getCourseOffering(offeringId) : null),
    enabled: !!offeringId,
    staleTime: 30_000,
  });
}

export function useOfferingInstructors(offeringId: string | null | undefined) {
  return useQuery({
    queryKey: ["offering-instructors", offeringId],
    queryFn: () => (offeringId ? getOfferingInstructors(offeringId) : null),
    enabled: !!offeringId,
    staleTime: 15_000,
  });
}

export function useCreateCourseOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCourseOfferingPayload) => createCourseOffering(payload),
    onSuccess: () => {
      toast.success("Course offering created.");
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to create course offering.");
    },
  });
}

export function useUpdateCourseOffering(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateCourseOfferingPayload>) =>
      updateCourseOffering(offeringId, payload),
    onSuccess: () => {
      toast.success("Course offering updated.");
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course", offeringId] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to update course offering.");
    },
  });
}

export function useDeleteCourseOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => deleteCourseOffering(offeringId),
    onSuccess: () => {
      toast.success("Course offering removed.");
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to delete course offering.");
    },
  });
}

export function usePublishOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => publishCourseOffering(offeringId),
    onSuccess: () => {
      toast.success("Course offering published.");
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Could not publish offering.");
    },
  });
}

export function useArchiveOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => archiveCourseOffering(offeringId),
    onSuccess: () => {
      toast.success("Course offering archived.");
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Could not archive offering.");
    },
  });
}

export function useCompleteOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => completeCourseOffering(offeringId),
    onSuccess: () => {
      toast.success("Course offering marked as completed.");
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Could not complete offering.");
    },
  });
}

export function useCancelOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => cancelCourseOffering(offeringId),
    onSuccess: () => {
      toast.success("Course offering cancelled.");
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Could not cancel offering.");
    },
  });
}

export function useAssignInstructor(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignInstructorPayload) =>
      assignOfferingInstructor(offeringId, payload),
    onSuccess: () => {
      toast.success("Instructor assigned successfully.");
      qc.invalidateQueries({ queryKey: ["offering-instructors", offeringId] });
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course", offeringId] });
      qc.invalidateQueries({ queryKey: ["my-teaching-courses"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to assign instructor.");
    },
  });
}

export function useUpdateInstructor(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      instructorId,
      payload,
    }: {
      instructorId: string;
      payload: UpdateInstructorPayload;
    }) => updateOfferingInstructor(offeringId, instructorId, payload),
    onSuccess: () => {
      toast.success("Instructor permissions updated.");
      qc.invalidateQueries({ queryKey: ["offering-instructors", offeringId] });
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course", offeringId] });
      qc.invalidateQueries({ queryKey: ["my-teaching-courses"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to update instructor.");
    },
  });
}

export function useRemoveInstructor(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (instructorId: string) =>
      removeOfferingInstructor(offeringId, instructorId),
    onSuccess: () => {
      toast.success("Instructor removed from course.");
      qc.invalidateQueries({ queryKey: ["offering-instructors", offeringId] });
      qc.invalidateQueries({ queryKey: ["course-offerings"] });
      qc.invalidateQueries({ queryKey: ["course", offeringId] });
      qc.invalidateQueries({ queryKey: ["my-teaching-courses"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to remove instructor.");
    },
  });
}
