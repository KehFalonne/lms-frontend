"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  archiveAnnouncement,
  createAnnouncement,
  getCourseAnnouncements,
  publishAnnouncement,
  updateAnnouncement,
  type CreateAnnouncementPayload,
} from "../api/announcements.api";
import { normalizeError } from "@/lib/api/errors";

export function useCourseAnnouncements(offeringId: string | null) {
  return useQuery({
    queryKey: ["course-announcements", offeringId],
    queryFn: () => getCourseAnnouncements(offeringId!),
    enabled: !!offeringId,
    staleTime: 30_000,
  });
}

export function useCreateAnnouncement(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) =>
      createAnnouncement(offeringId, payload),
    onSuccess: () => {
      toast.success("Announcement created");
      qc.invalidateQueries({ queryKey: ["course-announcements", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateAnnouncement(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateAnnouncementPayload>;
    }) => updateAnnouncement(id, payload),
    onSuccess: () => {
      toast.success("Announcement updated");
      qc.invalidateQueries({ queryKey: ["course-announcements", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function usePublishAnnouncement(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishAnnouncement(id),
    onSuccess: () => {
      toast.success("Announcement published");
      qc.invalidateQueries({ queryKey: ["course-announcements", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useArchiveAnnouncement(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveAnnouncement(id),
    onSuccess: () => {
      toast.success("Announcement archived");
      qc.invalidateQueries({ queryKey: ["course-announcements", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
