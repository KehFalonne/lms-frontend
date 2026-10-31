import { del, get, patch, post, put } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type {
  ContentItemDetail,
  ContentType,
  ModuleWithContent,
  ProgressStatus,
  CourseModule,
  ManageContentItem,
} from "../types/content.types";

export async function getContentTree(offeringId: string) {
  return get<ApiResponse<ModuleWithContent[]>>(
    `/my/course-offerings/${offeringId}/content-tree/`
  );
}

export async function getContentItem(contentId: string) {
  return get<ApiResponse<ContentItemDetail>>(`/content/${contentId}/`);
}

export async function getContentProgress(contentId: string) {
  return get<ApiResponse<{ status: ProgressStatus; progressPercent: number }>>(
    `/content/${contentId}/progress/`
  );
}

export async function getLecturerContentProgress(offeringId: string) {
  return get<
    ApiResponse<{
      modules: { id: string; title: string }[];
      rows: {
        studentId: string;
        studentName: string;
        studentNumber: string;
        moduleId: string;
        moduleTitle: string;
        contentId: string;
        contentTitle: string;
        contentType: ContentType;
        isRequired: boolean;
        status: ProgressStatus;
        progressPercent: number;
        startedAt: string | null;
        completedAt: string | null;
        lastAccessedAt: string | null;
        opened: boolean;
        downloaded: boolean;
      }[];
      academicGrading: { enabled: boolean; message: string };
    }>
  >(`/course-offerings/${offeringId}/content-progress/`);
}

export async function setContentProgress(
  contentId: string,
  status: ProgressStatus,
  progressPercent?: number
) {
  return put<
    ApiResponse<{ id: string; status: ProgressStatus; progressPercent: number }>
  >(`/content/${contentId}/progress/`, {
    status,
    ...(progressPercent !== undefined && { progressPercent }),
  });
}

export async function getModules(offeringId: string) {
  return get<ApiResponse<CourseModule[]>>(`/course-offerings/${offeringId}/modules/`);
}

export async function createModule(
  offeringId: string,
  payload: { title: string; description: string }
) {
  return post<ApiResponse<CourseModule>>(
    `/course-offerings/${offeringId}/modules/`,
    payload
  );
}

export async function updateModule(
  moduleId: string,
  payload: { title: string; description: string }
) {
  return patch<ApiResponse<CourseModule>>(`/modules/${moduleId}/`, payload);
}

export async function getModuleContent(moduleId: string) {
  return get<ApiResponse<ManageContentItem[]>>(`/modules/${moduleId}/content/`);
}

export async function createContentItem(
  moduleId: string,
  payload: {
    title: string;
    contentType: ContentType;
    description: string;
    body: string;
    externalUrl: string;
    fileId?: string;
    isRequired: boolean;
  }
) {
  return post<ApiResponse<ManageContentItem>>(`/modules/${moduleId}/content/`, payload);
}

export async function updateContentItem(
  contentId: string,
  payload: Partial<Parameters<typeof createContentItem>[1]>
) {
  const { contentType, externalUrl, fileId, isRequired, ...rest } = payload;
  return patch<ApiResponse<ManageContentItem>>(`/content/${contentId}/`, {
    ...rest,
    ...(contentType !== undefined && { content_type: contentType }),
    ...(externalUrl !== undefined && { external_url: externalUrl }),
    ...(fileId !== undefined && { file_id: fileId }),
    ...(isRequired !== undefined && { is_required: isRequired }),
  });
}

export async function publishContentItem(contentId: string, published: boolean) {
  return post<ApiResponse<ManageContentItem>>(
    `/content/${contentId}/${published ? "publish" : "unpublish"}/`
  );
}

export async function deleteContentItem(contentId: string) {
  return del<ApiResponse<unknown>>(`/content/${contentId}/`);
}
