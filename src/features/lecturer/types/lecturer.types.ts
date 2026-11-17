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
  courseOfferingId: string;
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

export interface CourseAnalyticsOverview {
  enrolledCount: number;
  assignmentCount: number;
  submittedCount: number;
  expectedSubmissions: number;
  submissionRate: number;
  gradedCount: number;
  averageGradePct: number | null;
  assessmentAttempts: number;
  completedAssessmentAttempts: number;
  assessmentCompletionRate: number;
  avgContentProgress: number;
  activeLearners30d: number;
}

export interface GradeBucket {
  bucket: string;
  count: number;
  share: number;
}

export interface EventTypeCount {
  type: string;
  label: string;
  count: number;
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface RecentActivityEvent {
  id: string;
  studentId: string | null;
  studentName: string;
  eventType: string;
  label: string;
  entityType: string;
  occurredAt: string;
}

export interface AssessmentPerformance {
  id: string;
  title: string;
  attempts: number;
  completed: number;
  completionRate: number;
  avgPercentage: number | null;
  bestPercentage: number | null;
  worstPercentage: number | null;
}

export interface CourseAnalytics {
  overview: CourseAnalyticsOverview;
  gradeDistribution: GradeBucket[];
  engagement: {
    eventsByType: EventTypeCount[];
    activityByDay: ActivityDay[];
  };
  recentActivity: RecentActivityEvent[];
  assessments: AssessmentPerformance[];
}

export interface LecturerCourseAnalyticsRow {
  id: string;
  code: string;
  title: string;
  section: string;
  semester: string;
  overview: CourseAnalyticsOverview;
}

export interface LecturerAnalyticsTotals {
  courseCount: number;
  enrolledCount: number;
  submissionRate: number;
  averageGradePct: number | null;
  assessmentCompletionRate: number;
  avgContentProgress: number;
  activeLearners30d: number;
}

export interface LecturerAnalytics {
  courses: LecturerCourseAnalyticsRow[];
  totals: LecturerAnalyticsTotals;
  gradeDistribution: GradeBucket[];
  activityByDay: ActivityDay[];
  recentActivity: RecentActivityEvent[];
}
