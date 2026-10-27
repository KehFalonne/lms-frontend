"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWsStatus } from "@/websocket/ws-provider";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications.api";
import { normalizeError } from "@/lib/api/errors";

export function useNotifications() {
  const wsStatus = useWsStatus();
  return useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => getNotifications(),
    staleTime: 20_000,
    // Poll every 30s when WS is down — instant when connected
    refetchInterval: wsStatus === "connected" ? false : 30_000,
  });
}

export function useUnreadNotificationsCount() {
  const wsStatus = useWsStatus();
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getNotifications({ unread: true }),
    staleTime: 20_000,
    refetchInterval: wsStatus === "connected" ? false : 30_000,
    select: (data) => data.data.length,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (res) => {
      toast.success(`${res.data.updated} notification(s) marked as read`);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
