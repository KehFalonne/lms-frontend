"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createPost,
  createTopic,
  getCourseForums,
  getForumTopics,
  getTopic,
  getTopicPosts,
  type CreatePostPayload,
  type CreateTopicPayload,
} from "../api/discussions.api";
import { normalizeError } from "@/lib/api/errors";
import { useWsStatus } from "@/websocket/ws-provider";

export function useCourseForums(offeringId: string | null) {
  return useQuery({
    queryKey: ["course-forums", offeringId],
    queryFn: () => getCourseForums(offeringId!),
    enabled: !!offeringId,
    staleTime: 30_000,
  });
}

export function useForumTopics(forumId: string | null) {
  return useQuery({
    queryKey: ["forum-topics", forumId],
    queryFn: () => getForumTopics(forumId!),
    enabled: !!forumId,
    staleTime: 20_000,
  });
}

export function useTopic(topicId: string | null) {
  return useQuery({
    queryKey: ["topic", topicId],
    queryFn: () => getTopic(topicId!),
    enabled: !!topicId,
    staleTime: 20_000,
  });
}

export function useTopicPosts(topicId: string | null) {
  const wsStatus = useWsStatus();
  return useQuery({
    queryKey: ["topic-posts", topicId],
    queryFn: () => getTopicPosts(topicId!),
    enabled: !!topicId,
    staleTime: 15_000,
    // Live via WS; poll every 15s only when disconnected
    refetchInterval: wsStatus === "connected" ? false : 15_000,
  });
}

export function useCreateTopic(forumId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTopicPayload) => createTopic(forumId, payload),
    onSuccess: () => {
      toast.success("Topic created");
      qc.invalidateQueries({ queryKey: ["forum-topics", forumId] });
      qc.invalidateQueries({ queryKey: ["course-forums"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useCreatePost(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(topicId, payload),
    onSuccess: () => {
      toast.success("Reply posted");
      qc.invalidateQueries({ queryKey: ["topic-posts", topicId] });
      qc.invalidateQueries({ queryKey: ["topic", topicId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
