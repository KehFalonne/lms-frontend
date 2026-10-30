"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createContentItem,
  createModule,
  deleteContentItem,
  getContentItem,
  getContentTree,
  getModuleContent,
  getModules,
  publishContentItem,
  setContentProgress,
  updateContentItem,
  updateModule,
} from "../api/content.api";
import type { ProgressStatus } from "../types/content.types";
import { normalizeError } from "@/lib/api/errors";

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

export function useCourseModules(offeringId: string | null) {
  return useQuery({
    queryKey: ["course-modules", offeringId],
    queryFn: () => getModules(offeringId!),
    enabled: !!offeringId,
  });
}

export function useModuleContent(moduleId: string) {
  return useQuery({
    queryKey: ["module-content", moduleId],
    queryFn: () => getModuleContent(moduleId),
  });
}

export function useCreateModule(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; description: string }) =>
      createModule(offeringId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-modules", offeringId] }),
  });
}

export function useUpdateModule(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
    }: {
      moduleId: string;
      payload: { title: string; description: string };
    }) => updateModule(moduleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-modules", offeringId] });
      toast.success("Module updated");
    },
    onError: (error) => toast.error(normalizeError(error).message),
  });
}

export function useCreateContentItem(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
    }: {
      moduleId: string;
      payload: Parameters<typeof createContentItem>[1];
    }) => createContentItem(moduleId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["module-content", variables.moduleId] });
      qc.invalidateQueries({ queryKey: ["course-modules", offeringId] });
    },
  });
}

export function useUpdateContentItem(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentId,
      payload,
    }: {
      contentId: string;
      payload: Parameters<typeof updateContentItem>[1];
    }) => updateContentItem(contentId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["module-content"] });
      qc.invalidateQueries({ queryKey: ["content-item", variables.contentId] });
      qc.invalidateQueries({ queryKey: ["course-modules", offeringId] });
      toast.success("Material updated");
    },
    onError: (error) => toast.error(normalizeError(error).message),
  });
}

export function usePublishContentItem(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contentId, published }: { contentId: string; published: boolean }) =>
      publishContentItem(contentId, published),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-modules", offeringId] });
      qc.invalidateQueries({ queryKey: ["module-content"] });
    },
  });
}

export function useDeleteContentItem(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContentItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-modules", offeringId] });
      qc.invalidateQueries({ queryKey: ["module-content"] });
    },
  });
}
