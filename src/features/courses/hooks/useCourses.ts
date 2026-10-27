"use client";
import { useQuery } from "@tanstack/react-query";

import { getCourseOffering, getMyCourses } from "../api/courses.api";

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
