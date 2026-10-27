import { del, get, patch, post } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type { CalendarItem, CreateCalendarEventPayload } from "../types/calendar.types";

export async function getCalendar(from: string, to: string) {
  return get<ApiResponse<CalendarItem[]>>("/calendar/", {
    params: { from, to },
  });
}

export async function createCalendarEvent(payload: CreateCalendarEventPayload) {
  return post<ApiResponse<unknown>>("/calendar-events/", payload);
}

export async function updateCalendarEvent(
  id: string,
  payload: Partial<CreateCalendarEventPayload>
) {
  return patch<ApiResponse<unknown>>(`/calendar-events/${id}/`, payload);
}

export async function deleteCalendarEvent(id: string) {
  return del(`/calendar-events/${id}/`);
}
