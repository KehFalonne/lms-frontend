"use client";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Edit2, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { del, get, patch, post } from "@/lib/api/client";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";
import { normalizeError } from "@/lib/api/errors";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils/cn";

export type FieldType = "text" | "textarea" | "number" | "date" | "select";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface ColumnConfig<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

export interface RowActionConfig<T> {
  label: string;
  onClick: (row: T) => void | Promise<void>;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger";
  disabled?: (row: T) => boolean;
}

interface Props<T> {
  title: string;
  description?: string;
  endpoint: string;
  queryKey: string;
  columns: ColumnConfig<T>[];
  fields: FormFieldConfig[];
  searchable?: boolean;
  rowActions?: RowActionConfig<T>[];
  emptyIcon?: LucideIcon;
  emptyMessage?: string;
  /** Custom payload builder — allows pages to shape data before POST/PATCH. */
  buildPayload?: (values: Record<string, string>) => Record<string, unknown>;
}

export function ResourceTable<T extends { id: string }>({
  title,
  description,
  endpoint,
  queryKey,
  columns,
  fields,
  searchable = true,
  rowActions = [],
  emptyIcon,
  emptyMessage = "Nothing here yet.",
  buildPayload,
}: Props<T>) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [queryKey, page, debounced],
    queryFn: () =>
      get<ApiResponse<T[]>>(endpoint, {
        params: { page, search: debounced, pageSize: 20 },
      }),
    staleTime: 30_000,
  });

  const rows = data?.data ?? [];
  const meta: PaginationMeta = data?.meta ?? {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  };

  const resetForm = () => {
    const empty: Record<string, string> = {};
    fields.forEach((f) => {
      empty[f.name] = f.defaultValue ?? "";
    });
    setFormValues(empty);
    setSubmitError(null);
  };

  const openCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (row: T) => {
    const values: Record<string, string> = {};
    fields.forEach((f) => {
      const v = (row as Record<string, unknown>)[f.name];
      values[f.name] = v != null ? String(v) : "";
    });
    setFormValues(values);
    setSubmitError(null);
    setEditRow(row);
  };

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => post(endpoint, payload),
    onSuccess: () => {
      toast.success(`${title.replace(/s$/, "")} created`);
      qc.invalidateQueries({ queryKey: [queryKey] });
      setCreateOpen(false);
      resetForm();
    },
    onError: (err) => setSubmitError(normalizeError(err).message),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      patch(`${endpoint}${editRow!.id}/`, payload),
    onSuccess: () => {
      toast.success(`${title.replace(/s$/, "")} updated`);
      qc.invalidateQueries({ queryKey: [queryKey] });
      setEditRow(null);
      resetForm();
    },
    onError: (err) => setSubmitError(normalizeError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`${endpoint}${id}/`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const onSubmit = () => {
    setSubmitError(null);

    // Required-field validation
    for (const f of fields) {
      if (f.required && !formValues[f.name]?.trim()) {
        setSubmitError(`${f.label} is required.`);
        return;
      }
    }

    const payload = buildPayload
      ? buildPayload(formValues)
      : (() => {
          const p: Record<string, unknown> = {};
          fields.forEach((f) => {
            const v = formValues[f.name];
            if (v === "" || v == null) return;
            p[f.name] = f.type === "number" ? Number(v) : v;
          });
          return p;
        })();

    if (editRow) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const renderForm = () => (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="mb-1.5 block text-sm font-medium">
            {f.label}
            {f.required && <span className="text-danger ml-0.5">*</span>}
          </label>
          {f.type === "textarea" ? (
            <Textarea
              value={formValues[f.name] ?? ""}
              onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
              rows={3}
            />
          ) : f.type === "select" ? (
            <Select
              value={formValues[f.name] ?? ""}
              onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
              placeholder="Select..."
              options={f.options ?? []}
            />
          ) : (
            <Input
              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
              value={formValues[f.name] ?? ""}
              onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}
      {submitError && (
        <p className="border-danger/30 bg-danger/10 text-danger rounded-md border px-3 py-2 text-sm">
          {submitError}
        </p>
      )}
    </div>
  );

  const EmptyIcon = emptyIcon;

  return (
    <div className="space-y-5">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
            <span aria-hidden className="bg-primary/50 h-px w-6" />
            Institutional Catalogue
          </p>
          <h1 className="text-foreground mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed sm:text-sm">
              {description}
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={openCreate}
          className="h-9 gap-1.5 self-start px-4 text-xs shadow-sm sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New {title.replace(/s$/, "")}</span>
        </Button>
      </div>

      {/* ─── Filter bar ────────────────────────────────────────── */}
      {searchable && (
        <div className="max-w-sm">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>
      )}

      {/* ─── States ────────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState icon={EmptyIcon} title="Nothing to show" description={emptyMessage} />
      )}

      {/* ─── Frosted Glass Table ───────────────────────────────── */}
      {!isLoading && !isError && rows.length > 0 && (
        <>
          <div className="ring-primary/10 overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_24px_48px_-28px_hsl(222_47%_22%/0.5)] ring-1 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/75">
            <div className="border-border/60 bg-muted/40 text-muted-foreground hidden border-b px-5 py-3 text-[11px] font-semibold tracking-wider uppercase sm:grid sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))_140px]">
              {columns.map((c) => (
                <div key={c.key}>{c.header}</div>
              ))}
              <div className="text-right">Actions</div>
            </div>
            {rows.map((row) => (
              <div
                key={row.id}
                className="border-border/40 hover:bg-primary/[0.03] flex flex-col gap-2 border-b p-4 transition-colors last:border-b-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))_140px] sm:items-center sm:px-5 sm:py-3.5"
              >
                {columns.map((c) => (
                  <div key={c.key} className="text-xs sm:text-sm">
                    <span className="text-muted-foreground text-[10px] font-semibold uppercase sm:hidden">
                      {c.header}:{" "}
                    </span>
                    {c.render(row)}
                  </div>
                ))}
                <div className="flex items-center gap-1.5 sm:justify-end">
                  {rowActions.map((action, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={action.variant === "danger" ? "ghost" : "outline"}
                      className={cn(
                        "h-7 px-2 text-xs",
                        action.variant === "danger"
                          ? "text-danger hover:bg-danger/10"
                          : ""
                      )}
                      disabled={action.disabled?.(row)}
                      onClick={() => action.onClick(row)}
                    >
                      {action.icon && <action.icon className="mr-1 h-3 w-3" />}
                      {action.label}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:bg-primary/10 h-7 px-2 text-xs"
                    onClick={() => openEdit(row)}
                  >
                    <Edit2 className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-danger hover:bg-danger/10 h-7 w-7"
                    title="Delete item"
                    onClick={() => {
                      if (confirm("Delete this item?")) {
                        deleteMutation.mutate(row.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* ─── Modals ────────────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onClose={() => !createMutation.isPending && setCreateOpen(false)}
        title={`New ${title.replace(/s$/, "")}`}
        size="lg"
        locked={createMutation.isPending}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        }
      >
        {renderForm()}
      </Dialog>

      <Dialog
        open={!!editRow}
        onClose={() => !updateMutation.isPending && setEditRow(null)}
        title={`Edit ${title.replace(/s$/, "")}`}
        size="lg"
        locked={updateMutation.isPending}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditRow(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={updateMutation.isPending}>
              Save
            </Button>
          </div>
        }
      >
        {renderForm()}
      </Dialog>
    </div>
  );
}
