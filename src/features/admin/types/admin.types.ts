// ── Admin user ───────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  universityId: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatar: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE" | "LOCKED";
  isStaff: boolean;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  studentProfile: {
    id: string;
    matriculeNumber: string;
    programmeId: string | null;
    facultyId: string | null;
    currentLevel: number;
    admissionYear: number;
    admissionDate: string | null;
    status: "ACTIVE" | "On_LEAVE" | "SUSPENDED" | "GRADUATED" | "WITHDRAWN";
  } | null;
  staffProfile: {
    id: string;
    staffNumber: string;
    departmentId: string | null;
    facultyId: string | null;
    jobTitle: string;
  } | null;
}

export interface AdminUserRoleAssignment {
  id: string;
  role: {
    id: string;
    code: string;
    name: string;
    description: string;
    isSystemRole: boolean;
  };
  scopeType: "GLOBAL" | "FACULTY" | "DEPARTMENT" | "COURSE";
  facultyId: string | null;
  departmentId: string | null;
  courseOfferingId: string | null;
  assignedAt: string;
  assignedBy: {
    id: string;
    universityId: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface CreateUserPayload {
  email: string;
  universityId: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  avatarFileId?: string;
  status?: AdminUser["status"];
  // Optional profile side-channel
  matriculeNumber?: string;
  staffNumber?: string;
  currentLevel?: number;
  admissionYear?: number;
  programmeId?: string;
  departmentId?: string;
  jobTitle?: string;
  studentStatus?: "ACTIVE" | "On_LEAVE" | "SUSPENDED" | "GRADUATED" | "WITHDRAWN";
  admissionDate?: string | null;
  profileType?: "student" | "staff" | "none";
}

// ── Roles ────────────────────────────────────────────────────────

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
  createdAt: string;
}

// ── Audit log ─────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actor: {
    id: string;
    universityId: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditFacets {
  actions: string[];
  entityTypes: string[];
}

// ── Admin stats ───────────────────────────────────────────────────

export interface AdminStats {
  students: number;
  staff: number;
  activeCourses: number;
  activeProgrammes: number;
}
