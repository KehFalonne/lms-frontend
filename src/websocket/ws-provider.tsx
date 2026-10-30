"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth.store";
import { wsManager, type WSStatus } from "./manager";
import type {
  AnnouncementPublishedPayload,
  DiscussionPostCreatedPayload,
  GradePublishedPayload,
  NotificationCreatedPayload,
  WSMessage,
} from "./types";

const WsContext = createContext<{ status: WSStatus }>({
  status: "disconnected",
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((s) => s.status);
  const [wsStatus, setWsStatus] = useState<WSStatus>("disconnected");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      wsManager.disconnect();
      return;
    }
    if (authStatus !== "authenticated") return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";
    wsManager.connect(token, baseUrl);
    const unsub = wsManager.subscribeStatus(setWsStatus);
    return () => {
      unsub();
    };
  }, [authStatus]);

  useEffect(() => {
    const unsub = wsManager.subscribe((msg: WSMessage) => {
      switch (msg.type) {
        case "notification.created": {
          const p = msg.payload as NotificationCreatedPayload;
          toast.info(p.title, { description: p.message, duration: 6000 });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          break;
        }

        case "grade.published": {
          const p = msg.payload as GradePublishedPayload;
          toast.success("New grade published", {
            description:
              p.score != null
                ? `Score: ${p.score} / ${p.maxScore}`
                : "Open your grades to see details.",
            duration: 8000,
          });
          queryClient.invalidateQueries({ queryKey: ["my-grades"] });
          queryClient.invalidateQueries({ queryKey: ["my-course-grades"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          break;
        }

        case "announcement.published": {
          const p = msg.payload as AnnouncementPublishedPayload;
          toast.info("New announcement", {
            description: p.title,
            duration: 6000,
          });
          queryClient.invalidateQueries({ queryKey: ["course-announcements"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          break;
        }

        case "discussion.post_created": {
          const p = msg.payload as DiscussionPostCreatedPayload;

          // Update the topic currently being viewed (if any)
          queryClient.invalidateQueries({
            queryKey: ["topic-posts", p.topicId],
          });
          queryClient.invalidateQueries({
            queryKey: ["topic", p.topicId],
          });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

          // Update the forum's topic list (post counts)
          queryClient.invalidateQueries({
            queryKey: ["forum-topics", p.forumId],
          });
          break;
        }

        case "ca.monitoring_updated": {
          queryClient.invalidateQueries({ queryKey: ["ca-monitoring"] });
          queryClient.invalidateQueries({ queryKey: ["attempt-live"] });
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ca:monitoring", { detail: msg.payload })
            );
          }
          break;
        }

        default:
          break;
      }
    });
    return () => {
      unsub();
    };
  }, [queryClient]);

  return <WsContext.Provider value={{ status: wsStatus }}>{children}</WsContext.Provider>;
}

export function useWsStatus() {
  return useContext(WsContext).status;
}
