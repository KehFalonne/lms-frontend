export interface CourseSummary {
  id: string;
  code: string;
  title: string;
  credits: number;
  level: number;
}

export interface SemesterSummary {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface ProgrammeSummary {
  id: string;
  name: string;
}

export interface CourseOfferingSummary {
  id: string;
  course: CourseSummary;
  semester: SemesterSummary;
  programme: ProgrammeSummary;
  programmes: ProgrammeSummary[];
  section: string;
  capacity: number;
  status: string;
}

export interface Enrollment {
  id: string;
  courseOffering: CourseOfferingSummary;
  status: string;
  enrolledAt: string;
}

export interface FullCourseOffering {
  id: string;
  course: {
    id: string;
    code: string;
    title: string;
    description: string;
    credits: number;
    level: number;
    courseType: string;
    status: string;
    prerequisiteCount: number;
  };
  semester: {
    id: string;
    name: string;
    code: string;
    sequence: number;
    startDate: string;
    endDate: string;
    status: string;
    isCurrent: boolean;
  };
  programme: {
    id: string;
    code: string;
    name: string;
    degreeType: string;
    durationYears: number;
  };
  eligibleProgrammes: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  section: string;
  capacity: number;
  status: string;
  publishedAt: string | null;
  enrolledCount: number;
  instructorCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TeachingRoleType =
  "PRIMARY_INSTRUCTOR" | "INSTRUCTOR" | "TEACHING_ASSISTANT" | "GRADER";

export interface CourseInstructor {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    universityId: string;
    avatar?: string | null;
  };
  teachingRole: TeachingRoleType;
  canManageContent: boolean;
  canGrade: boolean;
  canManageAssessments: boolean;
  canManageStudents: boolean;
  assignedAt: string;
}

export interface CreateCourseOfferingPayload {
  courseId: string;
  semesterId: string;
  programmeId: string;
  eligibleProgrammeIds?: string[];
  section: string;
  capacity: number;
  status?: string;
}

export interface AssignInstructorPayload {
  userId: string;
  teachingRole: TeachingRoleType;
  canManageContent?: boolean;
  canGrade?: boolean;
  canManageAssessments?: boolean;
  canManageStudents?: boolean;
}

export interface UpdateInstructorPayload {
  teachingRole?: TeachingRoleType;
  canManageContent?: boolean;
  canGrade?: boolean;
  canManageAssessments?: boolean;
  canManageStudents?: boolean;
}

// ── Enrollment Types ──────────────────────────────────────────────

export type EnrollmentStatus =
  "ACTIVE" | "PENDING" | "WITHDRAWN" | "COMPLETED" | "FAILED";

export interface StudentEnrollmentUser {
  id: string;
  universityId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  isStaff: boolean;
  isActive: boolean;
}

export interface CourseEnrollmentRecord {
  id: string;
  student: StudentEnrollmentUser;
  status: EnrollmentStatus;
  enrolledAt: string;
  withdrawnAt: string | null;
  completedAt: string | null;
  finalStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollStudentPayload {
  studentId: string;
  status?: EnrollmentStatus;
}

export interface BulkEnrollPayload {
  studentIds: string[];
}

export interface BulkEnrollResult {
  created: number;
  skipped: number;
}

export interface EnrollmentDecisionPayload {
  status: "ACTIVE" | "WITHDRAWN";
}
