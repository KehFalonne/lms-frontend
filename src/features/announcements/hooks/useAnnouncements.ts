"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiResponse } from "@/types/api.types";
import { post, get } from "@/lib/api/client";
import {
  archiveAnnouncement,
  createAnnouncement,
  getCourseAnnouncements,
  publishAnnouncement,
  updateAnnouncement,
  type CreateAnnouncementPayload,
} from "../api/announcements.api";
import { normalizeError } from "@/lib/api/errors";

export interface AnnouncementReader {
  id: string;
  universityId: string;
  firstName: string;
  lastName: string;
}

export interface AnnouncementReadersResponse {
  readCount: number;
  totalStudents: number;
  readers: AnnouncementReader[];
  notRead: AnnouncementReader[];
}

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

export function useMarkAnnouncementRead() {
  return useMutation({
    mutationFn: (announcementId: string) =>
      post(`/announcements/${announcementId}/mark-read/`),
  });
}

export function useAnnouncementReaders(announcementId: string | null) {
  return useQuery({
    queryKey: ["announcement-readers", announcementId],
    queryFn: () =>
      get<ApiResponse<AnnouncementReadersResponse>>(
        `/announcements/${announcementId}/readers/`
      ),
    enabled: !!announcementId,
    staleTime: 15_000,
  });
}
