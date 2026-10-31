"use client";
import { use, useMemo, useState } from "react";
import { Activity, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getLecturerContentProgress } from "@/features/content/api/content.api";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";

type ReportRow =
  Awaited<ReturnType<typeof getLecturerContentProgress>> extends {
    data: infer T;
  }
    ? T extends { rows: infer R }
      ? R extends (infer Row)[]
        ? Row
        : never
      : never
    : never;

const statusLabels = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
} as const;

export default function LecturerContentProgressPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [moduleId, setModuleId] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("all");

  const query = useQuery({
    queryKey: ["lecturer-content-progress", courseId],
    queryFn: () => getLecturerContentProgress(courseId),
    staleTime: 30_000,
  });
  const report = query.data?.data;
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (report?.rows ?? []).filter((row: ReportRow) => {
      const matchesModule = moduleId === "all" || row.moduleId === moduleId;
      const matchesStatus = status === "all" || row.status === status;
      const matchesStudent = studentId === "all" || row.studentId === studentId;
      const matchesSearch =
        !term ||
        row.studentName.toLowerCase().includes(term) ||
        row.studentNumber.toLowerCase().includes(term) ||
        row.contentTitle.toLowerCase().includes(term);
      return matchesModule && matchesStatus && matchesStudent && matchesSearch;
    });
  }, [moduleId, report?.rows, search, status, studentId]);

  const students = useMemo(
    () =>
      Array.from(
        new Map(
          (report?.rows ?? []).map((row) => [
            row.studentId,
            { id: row.studentId, name: row.studentName, number: row.studentNumber },
          ])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [report?.rows]
  );
  const summary = useMemo(() => {
    const total = rows.length;
    const completed = rows.filter((row) => row.status === "COMPLETED").length;
    const inProgress = rows.filter((row) => row.status === "IN_PROGRESS").length;
    const notStarted = rows.filter((row) => row.status === "NOT_STARTED").length;
    const average =
      total === 0
        ? 0
        : Math.round(rows.reduce((sum, row) => sum + row.progressPercent, 0) / total);
    return { total, completed, inProgress, notStarted, average };
  }, [rows]);
  const selectedStudent = students.find((student) => student.id === studentId);
  const selectedStudentRows = studentId === "all" ? [] : rows;
  const selectedCompleted = selectedStudentRows.filter(
    (row) => row.status === "COMPLETED"
  ).length;

  function exportCsv() {
    const header = [
      "Student",
      "Student number",
      "Module",
      "Content",
      "Type",
      "Required",
      "Progress %",
      "Status",
      "Started at",
      "Completed at",
      "Last accessed at",
      "Viewed",
      "Downloaded",
    ];
    const escape = (value: string | number | boolean | null) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      header,
      ...rows.map((row) => [
        row.studentName,
        row.studentNumber,
        row.moduleTitle,
        row.contentTitle,
        row.contentType,
        row.isRequired ? "Yes" : "No",
        row.progressPercent,
        statusLabels[row.status],
        row.startedAt,
        row.completedAt,
        row.lastAccessedAt,
        row.viewed ? "Yes" : "No",
        row.downloaded ? "Yes" : "No",
      ]),
    ]
      .map((line) => line.map(escape).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "content-progress-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.isError) {
    return (
      <ErrorState
        title="Could not load content progress"
        description={(query.error as Error)?.message ?? "Please try again."}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Content progress</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Review student engagement and completion evidence. This does not create academic
          marks.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Records", summary.total],
          ["Completed", summary.completed],
          ["In progress", summary.inProgress],
          ["Not started", summary.notStarted],
          ["Average progress", `${summary.average}%`],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-4">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="flex flex-wrap gap-3 p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student or content"
          className="border-border bg-background min-w-56 rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={moduleId}
          onChange={(event) => setModuleId(event.target.value)}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="all">All modules</option>
          {report?.modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="all">All students</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.number})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="border-border hover:bg-muted inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </Card>

      {selectedStudent && (
        <Card className="border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{selectedStudent.name}</p>
              <p className="text-muted-foreground text-xs">{selectedStudent.number}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">
                {selectedCompleted} of {selectedStudentRows.length} completed
              </p>
              <p className="text-muted-foreground text-xs">
                {selectedStudentRows.length
                  ? Math.round((selectedCompleted / selectedStudentRows.length) * 100)
                  : 0}
                % content completion
              </p>
            </div>
          </div>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No progress records found"
          description="Published content and enrolled students will appear here."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="border-border bg-surface/60 border-b">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs uppercase">
                  Student
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs uppercase">
                  Content
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs uppercase">
                  Progress
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs uppercase">
                  Completed
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs uppercase">
                  Last accessed
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs uppercase">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {rows.map((row) => (
                <tr key={`${row.studentId}-${row.contentId}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.studentName}</p>
                    <p className="text-muted-foreground text-xs">{row.studentNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{row.contentTitle}</p>
                    <p className="text-muted-foreground text-xs">{row.moduleTitle}</p>
                  </td>
                  <td className="px-4 py-3">{row.progressPercent}%</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        row.status === "COMPLETED"
                          ? "success"
                          : row.status === "IN_PROGRESS"
                            ? "info"
                            : "default"
                      }
                    >
                      {statusLabels[row.status]}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {row.completedAt ? new Date(row.completedAt).toLocaleString() : "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {row.contentType === "PDF"
                      ? `${row.opened ? "Opened" : "Not opened"} · ${row.downloaded ? "Downloaded" : "Not downloaded"}`
                      : row.contentType === "AUDIO"
                        ? row.viewed
                          ? "Listened"
                          : "Not listened"
                        : row.contentType === "VIDEO"
                          ? row.viewed
                            ? "Watched"
                            : "Not watched"
                          : row.viewed
                            ? "Viewed"
                            : "Not viewed"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {row.lastAccessedAt
                      ? new Date(row.lastAccessedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
