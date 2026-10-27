export interface TeachingCourse {
  id: string;
  course: {
    id: string;
    code: string;
    title: string;
    credits: number;
    level: number;
  };
  semester: { id: string; name: string };
  programme: { id: string; name: string };
  section: string;
  status: string;
  teachingRole: string;
  canGrade: boolean;
  canManageContent: boolean;
  studentCount: number;
  assignmentCount: number;
  assessmentCount: number;
  pendingSubmissions: number;
}

export interface LecturerStats {
  activeCourses: number;
  totalStudents: number;
  pendingSubmissions: number;
}

export interface UpcomingAssessment {
  id: string;
  title: string;
  availableFrom: string | null;
  courseOfferingId: string;
  courseCode: string;
}

export interface RecentSubmission {
  id: string;
  studentName: string;
  studentId: string;
  assignmentTitle: string;
  assignmentId: string;
  courseCode: string;
  submittedAt: string | null;
  isLate: boolean;
  status: string;
}

export interface LecturerDashboard {
  stats: LecturerStats;
  upcomingAssessments: UpcomingAssessment[];
  recentSubmissions: RecentSubmission[];
}
