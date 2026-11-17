"use client";
import { useQuery } from "@tanstack/react-query";

import {
  getCourseAnalytics,
  getLecturerAnalytics,
  getLecturerDashboard,
  getMyTeachingCourses,
} from "../api/lecturer.api";

export function useMyTeachingCourses() {
  return useQuery({
    queryKey: ["my-teaching-courses"],
    queryFn: getMyTeachingCourses,
    staleTime: 60_000,
  });
}

export function useLecturerDashboard() {
  return useQuery({
    queryKey: ["lecturer-dashboard"],
    queryFn: getLecturerDashboard,
    staleTime: 30_000,
  });
}

export function useCourseAnalytics(offeringId: string) {
  return useQuery({
    queryKey: ["course-analytics", offeringId],
    queryFn: () => getCourseAnalytics(offeringId),
    staleTime: 60_000,
  });
}

export function useLecturerAnalytics() {
  return useQuery({
    queryKey: ["lecturer-analytics"],
    queryFn: getLecturerAnalytics,
    staleTime: 60_000,
  });
}
