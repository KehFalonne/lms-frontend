export interface Announcement {
  id: string;
  courseOfferingId: string;
  title: string;
  body: string;
  isPinned: boolean;
  publishAt: string | null;
  expiresAt: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    universityId: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
