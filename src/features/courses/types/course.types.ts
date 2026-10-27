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
  section: string;
  capacity: number;
  status: string;
  publishedAt: string | null;
  enrolledCount: number;
  instructorCount: number;
  createdAt: string;
  updatedAt: string;
}
