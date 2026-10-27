import {
  BarChart3,
  BookMarked,
  BookOpen,
  Building2,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Bell,
  Calendar,
  LayoutDashboard,
  ScrollText,
  School,
  Settings,
  Shield,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/courses", icon: BookOpen },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Assessments", href: "/assessments", icon: FileQuestion },
  { label: "Grades", href: "/grades", icon: GraduationCap },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

const LECTURER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/lecturer/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/lecturer/courses", icon: BookOpen },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];
// Admin nav (used when the admin routes land in Sprint 10)
const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Roles", href: "/admin/roles", icon: Shield },
  { label: "Faculties", href: "/admin/faculties", icon: Building2 },
  { label: "Departments", href: "/admin/departments", icon: School },
  { label: "Programmes", href: "/admin/programmes", icon: BookMarked },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Academic Years", href: "/admin/academic-years", icon: Calendar },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
];

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Administrator",
  UNIVERSITY_ADMIN: "University Administrator",
  FACULTY_ADMIN: "Faculty Administrator",
  DEAN: "Dean",
  DEPARTMENT_ADMIN: "Department Administrator",
  HOD: "Head of Department",
  LECTURER: "Lecturer",
  TEACHING_ASSISTANT: "Teaching Assistant",
  STUDENT: "Student",
  PARENT_GUARDIAN: "Parent / Guardian",
};

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "UNIVERSITY_ADMIN",
  "FACULTY_ADMIN",
  "DEPARTMENT_ADMIN",
] as const;

export const LECTURER_ROLES = ["LECTURER", "TEACHING_ASSISTANT", "HOD", "DEAN"] as const;

export function getNavItems(roles: string[] = []): NavItem[] {
  if (roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r))) {
    return ADMIN_NAV;
  }
  if (roles.some((r) => (LECTURER_ROLES as readonly string[]).includes(r))) {
    return LECTURER_NAV;
  }
  return STUDENT_NAV;
}

export function roleBasedLanding(roles: string[] = []): string {
  if (roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r))) {
    return "/admin/dashboard";
  }
  if (roles.some((r) => (LECTURER_ROLES as readonly string[]).includes(r))) {
    return "/lecturer/dashboard";
  }
  return "/dashboard";
}

export function primaryRoleLabel(roles: string[] = []): string {
  for (const r of roles) {
    if (ROLE_LABELS[r]) return ROLE_LABELS[r];
  }
  return "User";
}
