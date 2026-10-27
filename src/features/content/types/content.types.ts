export type ContentType =
  "TEXT" | "VIDEO" | "AUDIO" | "PDF" | "DOCUMENT" | "LINK" | "EMBED" | "FILE";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface ContentItemSummary {
  id: string;
  title: string;
  contentType: ContentType;
  description: string;
  body: string;
  externalUrl: string;
  position: number;
  isRequired: boolean;
  progressStatus: ProgressStatus;
}

export interface ModuleWithContent {
  id: string;
  title: string;
  description: string;
  position: number;
  contentItems: ContentItemSummary[];
}

export interface ContentItemDetail {
  id: string;
  courseModuleId: string;
  title: string;
  contentType: ContentType;
  description: string;
  body: string;
  externalUrl: string;
  fileId: string | null;
  position: number;
  isRequired: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
