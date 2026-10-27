export type CalendarEventType =
  "LECTURE" | "ASSIGNMENT_DUE" | "EXAM" | "QUIZ" | "MEETING" | "OTHER";

export type CalendarSourceType = "EVENT" | "ASSIGNMENT_DUE" | "ASSESSMENT_WINDOW";

export interface CalendarItem {
  id: string;
  sourceType: CalendarSourceType;
  sourceId: string;
  eventType: CalendarEventType;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string;
  courseOfferingId: string | null;
  courseCode: string | null;
  courseTitle: string | null;
  canEdit: boolean;
}

export interface CreateCalendarEventPayload {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startAt: string;
  endAt: string;
  isAllDay?: boolean;
  location?: string;
  courseOfferingId?: string | null;
}
