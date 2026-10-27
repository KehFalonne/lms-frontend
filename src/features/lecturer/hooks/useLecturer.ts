"use client";
import { useQuery } from "@tanstack/react-query";

import { getLecturerDashboard, getMyTeachingCourses } from "../api/lecturer.api";

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
