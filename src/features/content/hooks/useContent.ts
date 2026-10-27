"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getContentItem, getContentTree, setContentProgress } from "../api/content.api";
import type { ProgressStatus } from "../types/content.types";

export function useContentTree(offeringId: string | null) {
  return useQuery({
    queryKey: ["content-tree", offeringId],
    queryFn: () => getContentTree(offeringId!),
    enabled: !!offeringId,
    staleTime: 30_000,
  });
}

export function useContentItem(contentId: string | null) {
  return useQuery({
    queryKey: ["content-item", contentId],
    queryFn: () => getContentItem(contentId!),
    enabled: !!contentId,
    staleTime: 60_000,
  });
}

export function useMarkProgress(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contentId, status }: { contentId: string; status: ProgressStatus }) =>
      setContentProgress(contentId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-tree", offeringId] });
    },
  });
}
