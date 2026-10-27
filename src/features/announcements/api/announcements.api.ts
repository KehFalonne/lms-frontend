import { get, patch, post } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { Announcement } from "../types/announcement.types";

export async function getCourseAnnouncements(offeringId: string) {
  return get<ApiResponse<Announcement[]>>(
    endpoints.courseOfferings.announcements(offeringId)
  );
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  isPinned?: boolean;
}

export async function createAnnouncement(
  offeringId: string,
  payload: CreateAnnouncementPayload
) {
  return post<ApiResponse<Announcement>>(
    endpoints.courseOfferings.announcements(offeringId),
    payload
  );
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<CreateAnnouncementPayload>
) {
  return patch<ApiResponse<Announcement>>(endpoints.announcements.detail(id), payload);
}

export async function publishAnnouncement(id: string) {
  return post<ApiResponse<Announcement>>(endpoints.announcements.publish(id));
}

export async function archiveAnnouncement(id: string) {
  return post<ApiResponse<Announcement>>(endpoints.announcements.archive(id));
}
