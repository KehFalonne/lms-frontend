import {
  BarChart3,
  BookMarked,
  BookOpen,
  Building2,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Layers,
  Bell,
  Calendar,
  LayoutDashboard,
  ScrollText,
  School,
  Settings,
  Shield,
  User,
  Users,
  Flag,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavItem[];
  // Extra path patterns with "*" wildcards for dynamic segments, e.g. "/admin/courses/*/assessments".
  match?: string[];
  // When set, the item is only shown to users holding this permission code
  // (or superusers).
  permission?: string;
}

export interface WorkspaceOption {
  label: string;
  href: string;
}

export type WorkspaceKey = "admin" | "lecturer" | "invigilator" | "student";

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/courses", icon: BookOpen },
  { label: "Course Registration", href: "/course-registration", icon: GraduationCap },
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
  { label: "Analytics", href: "/lecturer/analytics", icon: BarChart3 },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Appeals", href: "/lecturer/appeals", icon: Flag },
  { label: "Profile", href: "/profile", icon: User },
];

const INVIGILATOR_NAV: NavItem[] = [
  { label: "Invigilator Dashboard", href: "/invigilator/dashboard", icon: ClipboardList },
  { label: "CA Sessions", href: "/invigilator/sessions", icon: Shield },
  { label: "Course Assessments", href: "/lecturer/courses", icon: FileQuestion },
  { label: "Notifications", href: "/invigilator/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Users & Access",
    icon: Users,
    children: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles", href: "/admin/roles", icon: Shield },
    ],
  },
  {
    label: "Academic Management",
    icon: School,
    children: [
      { label: "Faculties", href: "/admin/faculties", icon: Building2 },
      { label: "Departments", href: "/admin/departments", icon: School },
      { label: "Programmes", href: "/admin/programmes", icon: BookMarked },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Course Offerings", href: "/admin/course-offerings", icon: Layers },
      {
        label: "Course Assessments",
        href: "/admin/courses/assessments",
        icon: FileQuestion,
        match: ["/admin/courses/*/assessments"],
      },
      { label: "Academic Years", href: "/admin/academic-years", icon: Calendar },
      { label: "Semesters", href: "/admin/semesters", icon: Calendar },
    ],
  },
  {
    label: "Operations & Reports",
    icon: BarChart3,
    children: [
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "CA Sessions", href: "/admin/ca-sessions", icon: ClipboardList },
      { label: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "System",
    icon: Settings,
    children: [
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ScrollText,
        permission: "audit.view",
      },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
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

function filterNavByPermission(
  items: NavItem[],
  permissions: string[],
  isSuperuser: boolean
): NavItem[] {
  return items
    .map((item) => {
      if (item.children?.length) {
        const children = filterNavByPermission(item.children, permissions, isSuperuser);
        return children.length ? { ...item, children } : null;
      }
      return !item.permission || isSuperuser || permissions.includes(item.permission)
        ? item
        : null;
    })
    .filter((item): item is NavItem => item !== null);
}

export function getNavItems(
  roles: string[] = [],
  hasStaffProfile = false,
  workspace?: WorkspaceKey,
  hasStudentProfile = false,
  isStaff = false,
  permissions: string[] = [],
  isSuperuser = false
): NavItem[] {
  return filterNavByPermission(
    resolveNavItems(roles, hasStaffProfile, workspace, hasStudentProfile, isStaff),
    permissions,
    isSuperuser
  );
}

function resolveNavItems(
  roles: string[] = [],
  hasStaffProfile = false,
  workspace?: WorkspaceKey,
  hasStudentProfile = false,
  isStaff = false
): NavItem[] {
  const isAdmin = roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r));
  const isLecturer = roles.some((r) => (LECTURER_ROLES as readonly string[]).includes(r));
  const isStudent = roles.includes("STUDENT");

  if (workspace === "admin" && isAdmin) return ADMIN_NAV;
  if (workspace === "lecturer" && (isLecturer || isStaff)) return LECTURER_NAV;
  if (workspace === "invigilator" && hasStaffProfile) return INVIGILATOR_NAV;
  if (workspace === "student" && (isStudent || hasStudentProfile)) return STUDENT_NAV;

  if (isAdmin) {
    return [
      ...ADMIN_NAV,
      ...(isLecturer
        ? LECTURER_NAV.filter(
            (item) =>
              item.href === "/lecturer/courses" || item.href === "/lecturer/appeals"
          )
        : []),
      ...(hasStaffProfile ? INVIGILATOR_NAV.slice(0, 1) : []),
    ];
  }
  if (isLecturer || isStaff)
    return [...LECTURER_NAV, ...(hasStaffProfile ? INVIGILATOR_NAV.slice(0, 1) : [])];
  if (hasStaffProfile) return INVIGILATOR_NAV;
  return isStudent || hasStudentProfile ? STUDENT_NAV : [];
}

export function workspaceFromPathname(pathname: string): WorkspaceKey | undefined {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/lecturer")) return "lecturer";
  if (pathname.startsWith("/invigilator")) return "invigilator";
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/assignments") ||
    pathname.startsWith("/assessments") ||
    pathname.startsWith("/grades")
  ) {
    return "student";
  }
  return undefined;
}

export function getWorkspaceOptions(
  roles: string[] = [],
  hasStaffProfile = false,
  hasStudentProfile = false,
  isStaff = false
): WorkspaceOption[] {
  const options: WorkspaceOption[] = [];
  const isAdmin = roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r));
  const isLecturer = roles.some((r) => (LECTURER_ROLES as readonly string[]).includes(r));

  if (isAdmin) options.push({ label: "Administrator", href: "/admin/dashboard" });
  if (isLecturer) options.push({ label: "Lecturer", href: "/lecturer/dashboard" });
  if (isStaff && !isAdmin) options.push({ label: "Lecturer", href: "/lecturer/courses" });
  if (hasStaffProfile)
    options.push({ label: "Invigilator", href: "/invigilator/dashboard" });
  if (roles.includes("STUDENT") || hasStudentProfile)
    options.push({ label: "Student", href: "/dashboard" });

  return options;
}

export function flattenNavItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenNavItems(item.children) : []),
  ]);
}

function matchesPattern(pattern: string, pathname: string): boolean {
  const escaped = pattern
    .split("/")
    .map((segment) =>
      segment === "*" ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("/");
  return new RegExp(`^${escaped}(/|$)`).test(pathname);
}

/** Longest-prefix match — the most specific matching nav item wins. */
export function bestMatchNavItem(items: NavItem[], pathname: string): NavItem | null {
  return (
    flattenNavItems(items)
      .filter((item) => {
        if (!item.href) return false;
        if (pathname === item.href || pathname.startsWith(item.href + "/")) return true;
        return (item.match ?? []).some((pattern) => matchesPattern(pattern, pathname));
      })
      .sort((a, b) => navMatchScore(b, pathname) - navMatchScore(a, pathname))[0] ?? null
  );
}

function navMatchScore(item: NavItem, pathname: string): number {
  let best = 0;
  if (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) {
    best = Math.max(best, item.href.length);
  }
  for (const pattern of item.match ?? []) {
    if (matchesPattern(pattern, pathname)) best = Math.max(best, pattern.length);
  }
  return best;
}

export function roleBasedLanding(
  roles: string[] = [],
  hasStaffProfile = false,
  hasStudentProfile = false,
  isStaff = false
): string {
  if (roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r))) {
    return "/admin/dashboard";
  }
  if (roles.some((r) => (LECTURER_ROLES as readonly string[]).includes(r))) {
    return "/lecturer/dashboard";
  }
  if (hasStaffProfile) return "/invigilator/dashboard";
  if (isStaff) return "/lecturer/courses";
  return hasStudentProfile ? "/dashboard" : "/";
}

export function primaryRoleLabel(roles: string[] = []): string {
  for (const r of roles) {
    if (ROLE_LABELS[r]) return ROLE_LABELS[r];
  }
  return "User";
}
