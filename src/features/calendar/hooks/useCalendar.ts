"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendar,
  updateCalendarEvent,
} from "../api/calendar.api";
import type { CreateCalendarEventPayload } from "../types/calendar.types";
import { normalizeError } from "@/lib/api/errors";

export function useCalendar(from: string, to: string) {
  return useQuery({
    queryKey: ["calendar", from, to],
    queryFn: () => getCalendar(from, to),
    staleTime: 30_000,
  });
}

export function useCreateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCalendarEventPayload) => createCalendarEvent(payload),
    onSuccess: () => {
      toast.success("Event created");
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCalendarEventPayload>;
    }) => updateCalendarEvent(id, payload),
    onSuccess: () => {
      toast.success("Event updated");
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useDeleteCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: () => {
      toast.success("Event deleted");
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
