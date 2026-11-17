"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getCourseOffering,
  getCourseOfferings,
  getMyCourses,
  requestEnrollment,
} from "../api/courses.api";
import { normalizeError } from "@/lib/api/errors";

export function useMyCourses() {
  return useQuery({
    queryKey: ["my-courses"],
    queryFn: getMyCourses,
    staleTime: 60_000,
  });
}

export function useCourse(offeringId: string | null) {
  return useQuery({
    queryKey: ["course-offering", offeringId],
    queryFn: () => getCourseOffering(offeringId!),
    enabled: !!offeringId,
    staleTime: 60_000,
  });
}

/**
 * Fetches available (ACTIVE) course offerings.
 * When programmeId is provided, offerings are filtered for that programme.
 * When semesterId is provided, results are further scoped to that semester.
 */
export function useAvailableOfferings(params?: {
  programmeId?: string | null;
  semesterId?: string | null;
  search?: string;
  enabled?: boolean;
}) {
  const { programmeId, semesterId, search, enabled = true } = params ?? {};
  const queryParams: Record<string, unknown> = { status: "ACTIVE" };
  if (programmeId) queryParams.programme = programmeId;
  if (semesterId) queryParams.semester = semesterId;
  if (search) queryParams.search = search;

  return useQuery({
    queryKey: ["available-offerings", queryParams],
    queryFn: () => getCourseOfferings(queryParams),
    enabled,
    staleTime: 60_000,
  });
}

/** Submits a self-enrollment request for a given offering. */
export function useRequestEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => requestEnrollment(offeringId),
    onSuccess: (res) => {
      toast.success(res.message || "You have been enrolled in this course.");
      qc.invalidateQueries({ queryKey: ["my-courses"] });
      qc.invalidateQueries({ queryKey: ["available-offerings"] });
    },
    onError: (err) => {
      toast.error(normalizeError(err).message || "Failed to request enrollment.");
    },
  });
}
