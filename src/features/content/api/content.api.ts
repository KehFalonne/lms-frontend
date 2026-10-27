import { get, post, put } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type {
  ContentItemDetail,
  ModuleWithContent,
  ProgressStatus,
} from "../types/content.types";

export async function getContentTree(offeringId: string) {
  return get<ApiResponse<ModuleWithContent[]>>(
    `/my/course-offerings/${offeringId}/content-tree/`
  );
}

export async function getContentItem(contentId: string) {
  return get<ApiResponse<ContentItemDetail>>(`/content/${contentId}/`);
}

export async function setContentProgress(contentId: string, status: ProgressStatus) {
  return put<ApiResponse<unknown>>(`/content/${contentId}/progress/`, {
    status,
  });
}
