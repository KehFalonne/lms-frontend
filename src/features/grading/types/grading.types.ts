export interface CategoryBreakdown {
  category: string;
  weight: string;
  average: string;
  weighted: string;
}

export interface CourseFinalGrade {
  courseOfferingId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  percentage: string;
  letterGrade: string;
  categories: CategoryBreakdown[];
}

export interface PublishedGradeItem {
  gradeItemId: string;
  name: string;
  category: string | null;
  maxScore: string;
  score: string | null;
  percentage: string | null;
  letterGrade: string;
  feedback: string;
}

export interface CourseGradeDetail {
  items: PublishedGradeItem[];
  final: {
    percentage: string;
    letterGrade: string;
    categories: CategoryBreakdown[];
  };
}
export interface GradebookItem {
  id: string;
  name: string;
  maxScore: string;
  categoryId: string | null;
  categoryName: string | null;
  isPublished: boolean;
  position: number;
}

export interface GradebookCell {
  id: string | null;
  score: string | null;
  percentage: string | null;
  status: "DRAFT" | "PUBLISHED" | "VOID" | "MISSING";
  letterGrade: string;
  feedback: string;
}

export interface GradebookRow {
  studentId: string;
  studentName: string;
  studentNumber: string;
  grades: Record<string, GradebookCell>;
}

export interface GradebookData {
  items: GradebookItem[];
  students: GradebookRow[];
}

export interface GradeCategory {
  id: string;
  courseOffering: string;
  name: string;
  weight: string;
  position: number;
  itemCount: number;
}

export interface CategoryWeightInput {
  name: string;
  weight: string;
}
