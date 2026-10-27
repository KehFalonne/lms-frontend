export type UserRole =
  | "SUPER_ADMIN"
  | "UNIVERSITY_ADMIN"
  | "FACULTY_ADMIN"
  | "DEAN"
  | "DEPARTMENT_ADMIN"
  | "HOD"
  | "LECTURER"
  | "TEACHING_ASSISTANT"
  | "STUDENT"
  | "PARENT_GUARDIAN";

export interface StudentProfile {
  id: string;
  matriculeNumber: string;
  currentLevel: number;
  admissionYear: number;
  status: string;
}

export interface StaffProfile {
  id: string;
  staffNumber: string;
  jobTitle: string;
}

export interface AuthUser {
  id: string;
  universityId: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatar: string;
  status: string;
  isStaff: boolean;
  isActive: boolean;
  isSuperuser: boolean;
  roles: UserRole[];
  permissions: string[];
  studentProfile: StudentProfile | null;
  staffProfile: StaffProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Pick<
    AuthUser,
    | "id"
    | "universityId"
    | "email"
    | "firstName"
    | "middleName"
    | "lastName"
    | "avatar"
    | "roles"
  >;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  uid: string;
  token: string;
  newPassword: string;
}
