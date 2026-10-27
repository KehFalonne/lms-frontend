/**
 * Central endpoint registry.
 * Add routes here as new features ship. Never inline URL strings in feature
 * modules — always reference this file.
 */
export const endpoints = {
  auth: {
    login: "/auth/login/",
    logout: "/auth/logout/",
    refresh: "/auth/token/refresh/",
    me: "/auth/me/",
    changePassword: "/auth/change-password/",
    forgotPassword: "/auth/forgot-password/",
    resetPassword: "/auth/reset-password/",
  },

  // ── Users & RBAC ────────────────────────────────────────────────
  users: {
    list: "/users/",
    detail: (id: string) => `/users/${id}/`,
    activate: (id: string) => `/users/${id}/activate/`,
    deactivate: (id: string) => `/users/${id}/deactivate/`,
    assignRole: (id: string) => `/users/${id}/assign-role/`,
    revokeRole: (id: string, assignmentId: string) =>
      `/users/${id}/roles/${assignmentId}/`,
  },
  roles: {
    list: "/roles/",
    detail: (id: string) => `/roles/${id}/`,
    permissions: (id: string) => `/roles/${id}/permissions/`,
  },
  permissions: "/permissions/",

  // ── University & academics ─────────────────────────────────────
  faculties: {
    list: "/faculties/",
    detail: (id: string) => `/faculties/${id}/`,
  },
  departments: {
    list: "/departments/",
    detail: (id: string) => `/departments/${id}/`,
  },
  programmes: {
    list: "/programmes/",
    detail: (id: string) => `/programmes/${id}/`,
  },
  academicYears: {
    list: "/academic-years/",
    detail: (id: string) => `/academic-years/${id}/`,
    setCurrent: (id: string) => `/academic-years/${id}/set-current/`,
  },
  semesters: {
    list: "/semesters/",
    detail: (id: string) => `/semesters/${id}/`,
    setCurrent: (id: string) => `/semesters/${id}/set-current/`,
  },

  // ── Course catalogue ───────────────────────────────────────────
  courses: {
    list: "/courses/",
    detail: (id: string) => `/courses/${id}/`,
    prerequisites: (id: string) => `/courses/${id}/prerequisites/`,
    deletePrerequisite: (id: string, prereqId: string) =>
      `/courses/${id}/prerequisites/${prereqId}/`,
  },

  // ── Course offerings ───────────────────────────────────────────
  courseOfferings: {
    list: "/course-offerings/",
    detail: (id: string) => `/course-offerings/${id}/`,
    publish: (id: string) => `/course-offerings/${id}/publish/`,
    complete: (id: string) => `/course-offerings/${id}/complete/`,
    archive: (id: string) => `/course-offerings/${id}/archive/`,
    cancel: (id: string) => `/course-offerings/${id}/cancel/`,

    // Nested resources
    instructors: (id: string) => `/course-offerings/${id}/instructors/`,
    instructor: (id: string, instructorId: string) =>
      `/course-offerings/${id}/instructors/${instructorId}/`,
    enrollments: (id: string) => `/course-offerings/${id}/enrollments/`,
    bulkEnroll: (id: string) => `/course-offerings/${id}/enrollments/bulk/`,
    enrollment: (id: string, studentId: string) =>
      `/course-offerings/${id}/enrollments/${studentId}/`,
    modules: (id: string) => `/course-offerings/${id}/modules/`,
    assignments: (id: string) => `/course-offerings/${id}/assignments/`,
    assessments: (id: string) => `/course-offerings/${id}/assessments/`,
    gradeCategories: (id: string) => `/course-offerings/${id}/grade-categories/`,
    setCategoryWeights: (id: string) =>
      `/course-offerings/${id}/grade-categories/set-weights/`,
    gradeItems: (id: string) => `/course-offerings/${id}/grade-items/`,
    announcements: (id: string) => `/course-offerings/${id}/announcements/`,
    forums: (id: string) => `/course-offerings/${id}/forums/`,
    gradesPublish: (id: string) => `/course-offerings/${id}/grades/publish/`,
  },

  // ── Content ────────────────────────────────────────────────────
  content: {
    modules: {
      detail: (id: string) => `/modules/${id}/`,
      items: (moduleId: string) => `/modules/${moduleId}/content/`,
    },
    items: {
      detail: (id: string) => `/content/${id}/`,
      publish: (id: string) => `/content/${id}/publish/`,
      unpublish: (id: string) => `/content/${id}/unpublish/`,
      progress: (id: string) => `/content/${id}/progress/`,
    },
    myContentTree: (offeringId: string) =>
      `/my/course-offerings/${offeringId}/content-tree/`,
  },

  // ── Files ──────────────────────────────────────────────────────
  files: {
    uploadUrl: "/files/upload-url/",
    complete: "/files/complete/",
    downloadUrl: (id: string) => `/files/${id}/download-url/`,
    detail: (id: string) => `/files/${id}/`,
  },

  // ── Assignments ────────────────────────────────────────────────
  assignments: {
    detail: (id: string) => `/assignments/${id}/`,
    publish: (id: string) => `/assignments/${id}/publish/`,
    close: (id: string) => `/assignments/${id}/close/`,
    mySubmission: (id: string) => `/assignments/${id}/submission/`,
    submissions: (id: string) => `/assignments/${id}/submissions/`,
    submission: (id: string) => `/assignment-submissions/${id}/`,
    grade: (id: string) => `/assignment-submissions/${id}/grade/`,
  },

  // ── Assessments ────────────────────────────────────────────────
  assessments: {
    detail: (id: string) => `/assessments/${id}/`,
    publish: (id: string) => `/assessments/${id}/publish/`,
    close: (id: string) => `/assessments/${id}/close/`,
    questions: (id: string) => `/assessments/${id}/questions/`,
    question: (id: string, aqId: string) => `/assessments/${id}/questions/${aqId}/`,
    startAttempt: (id: string) => `/assessments/${id}/attempts/start/`,
  },
  attempts: {
    detail: (id: string) => `/assessment-attempts/${id}/`,
    live: (id: string) => `/assessment-attempts/${id}/live/`,
    answer: (id: string, aqId: string) => `/assessment-attempts/${id}/answers/${aqId}/`,
    submit: (id: string) => `/assessment-attempts/${id}/submit/`,
  },

  // ── Question banks ─────────────────────────────────────────────
  questionBanks: {
    list: "/question-banks/",
    detail: (id: string) => `/question-banks/${id}/`,
    questions: (bankId: string) => `/question-banks/${bankId}/questions/`,
  },
  questions: {
    detail: (id: string) => `/questions/${id}/`,
    duplicate: (id: string) => `/questions/${id}/duplicate/`,
  },

  // ── Grading ────────────────────────────────────────────────────
  gradeCategories: {
    detail: (id: string) => `/grade-categories/${id}/`,
  },
  gradeItems: {
    detail: (id: string) => `/grade-items/${id}/`,
    publish: (id: string) => `/grade-items/${id}/publish/`,
    grades: (id: string) => `/grade-items/${id}/grades/`,
    studentGrade: (id: string, studentId: string) =>
      `/grade-items/${id}/grades/${studentId}/`,
  },
  grades: {
    history: (id: string) => `/grades/${id}/history/`,
  },

  // ── Announcements ──────────────────────────────────────────────
  announcements: {
    detail: (id: string) => `/announcements/${id}/`,
    publish: (id: string) => `/announcements/${id}/publish/`,
    archive: (id: string) => `/announcements/${id}/archive/`,
  },

  // ── Discussions ────────────────────────────────────────────────
  discussions: {
    forum: (id: string) => `/forums/${id}/`,
    forumTopics: (forumId: string) => `/forums/${forumId}/topics/`,
    topic: (id: string) => `/topics/${id}/`,
    topicPosts: (topicId: string) => `/topics/${topicId}/posts/`,
    post: (id: string) => `/posts/${id}/`,
  },

  // ── Notifications ──────────────────────────────────────────────
  notifications: {
    list: "/notifications/",
    markRead: (id: string) => `/notifications/${id}/read/`,
    markAllRead: "/notifications/read-all/",
  },

  // ── Analytics ──────────────────────────────────────────────────
  analytics: {
    learningEvents: "/learning-events/",
    dashboards: {
      student: "/dashboards/student/",
      lecturer: "/dashboards/lecturer/",
      admin: "/dashboards/admin/",
    },
    adminStats: "/admin/stats/",
    adminDashboard: "/admin/dashboard/",
  },

  // ── Audit ──────────────────────────────────────────────────────
  audit: {
    logs: "/audit-logs/",
  },

  // ── "My" convenience routes ────────────────────────────────────
  my: {
    courses: "/my/courses/",
    courseOffering: (id: string) => `/my/course-offerings/${id}/`,
    teachingCourses: "/my/teaching-courses/",
    assignments: "/my/assignments/",
    assessments: "/my/assessments/",
    grades: "/my/grades/",
    courseGrades: (offeringId: string) => `/my/course-offerings/${offeringId}/grades/`,
  },

  // ── Lecturer dashboard ─────────────────────────────────────────
  lecturer: {
    dashboardStats: "/lecturer/dashboard/stats/",
  },

  // ── Health ─────────────────────────────────────────────────────
  health: {
    live: "/health/live/",
    ready: "/health/ready/",
  },
} as const;
