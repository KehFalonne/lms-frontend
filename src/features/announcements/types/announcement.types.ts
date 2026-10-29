import type { Schema } from "@/types/api.types";

/**
 * All these types are derived from the OpenAPI schema, so they can't drift
 * out of sync with the backend.
 */
export type Announcement = Schema<"Announcement">;
export type AnnouncementAuthor = Schema<"User">;
export type AnnouncementStatus = Announcement["status"];
