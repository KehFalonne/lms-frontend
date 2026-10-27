export type SubmissionType =
  "FILE_UPLOAD" | "TEXT_ENTRY" | "FILE_AND_TEXT" | "EXTERNAL_TOOL";

export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export type SubmissionStatus =
  "DRAFT" | "SUBMITTED" | "LATE" | "RETURNED" | "GRADED" | "MISSING";

export interface MySubmissionSummary {
  id: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  isLate: boolean;
  score: string | null;
}

export interface MyAssignment {
  id: string;
  title: string;
  courseOfferingId: string;
  courseCode: string;
  courseTitle: string;
  maxScore: string;
  dueAt: string;
  allowLateSubmission: boolean;
  submissionType: SubmissionType;
  status: AssignmentStatus;
  mySubmission: MySubmissionSummary | null;
}

export interface AssignmentDetail {
  id: string;
  courseOfferingId: string;
  title: string;
  description: string;
  instructions: string;
  maxScore: string;
  availableFrom: string | null;
  dueAt: string;
  availableUntil: string | null;
  allowLateSubmission: boolean;
  latePenaltyType: "NONE" | "PERCENTAGE" | "POINTS";
  latePenaltyValue: string;
  submissionType: SubmissionType;
  maxAttempts: number;
  status: AssignmentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionFile {
  id: string;
  file: string; // File UUID
  createdAt: string;
}

export interface SubmissionFeedbackEntry {
  id: string;
  author: { id: string; firstName: string; lastName: string } | null;
  content: string;
  createdAt: string;
}

export interface MySubmission {
  id: string;
  assignment: string;
  student: {
    id: string;
    universityId: string;
    firstName: string;
    lastName: string;
  };
  attemptNumber: number;
  status: SubmissionStatus;
  submittedAt: string | null;
  isLate: boolean;
  textContent: string;
  files: SubmissionFile[];
  score: string | null;
  feedback: string;
  feedbackEntries: SubmissionFeedbackEntry[];
  gradedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
