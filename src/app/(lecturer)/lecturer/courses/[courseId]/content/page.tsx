"use client";

import { use, useState } from "react";
import { BookOpen, Pencil, Plus, Send, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader, type UploadedFile } from "@/components/ui/file-uploader";
import {
  useCourseModules,
  useCreateContentItem,
  useCreateModule,
  useDeleteContentItem,
  useModuleContent,
  usePublishContentItem,
  useUpdateModule,
  useUpdateContentItem,
} from "@/features/content/hooks/useContent";
import type {
  ContentType,
  CourseModule,
  ManageContentItem,
} from "@/features/content/types/content.types";

export default function LecturerContentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data, isLoading, isError, refetch } = useCourseModules(courseId);
  const createModule = useCreateModule(courseId);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: "", description: "" });

  const modules = data?.data ?? [];

  function submitModule() {
    if (!newModule.title.trim()) return;
    createModule.mutate(
      { title: newModule.title.trim(), description: newModule.description.trim() },
      {
        onSuccess: () => {
          setNewModule({ title: "", description: "" });
          setModuleDialogOpen(false);
        },
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Course content</h2>
          <p className="text-muted-foreground text-sm">
            Organize learning materials into modules and publish them when ready.
          </p>
        </div>
        <Button size="sm" onClick={() => setModuleDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> New module
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && modules.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No modules yet"
          description="Create a module to start adding course materials."
          action={
            <Button onClick={() => setModuleDialogOpen(true)}>Create module</Button>
          }
        />
      )}
      {!isLoading && !isError && modules.length > 0 && (
        <div className="space-y-3">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} courseId={courseId} />
          ))}
        </div>
      )}

      <Dialog
        open={moduleDialogOpen}
        onClose={() => !createModule.isPending && setModuleDialogOpen(false)}
        title="Create module"
        description="Use modules to group materials by week, topic, or unit."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setModuleDialogOpen(false)}
              disabled={createModule.isPending}
            >
              Cancel
            </Button>
            <Button onClick={submitModule} loading={createModule.isPending}>
              Create module
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            value={newModule.title}
            onChange={(event) =>
              setNewModule({ ...newModule, title: event.target.value })
            }
            placeholder="e.g. Week 1: Introduction"
            aria-label="Module title"
          />
          <Textarea
            value={newModule.description}
            onChange={(event) =>
              setNewModule({ ...newModule, description: event.target.value })
            }
            placeholder="Optional description"
            rows={3}
            aria-label="Module description"
          />
        </div>
      </Dialog>
    </div>
  );
}

function ModuleCard({ module, courseId }: { module: CourseModule; courseId: string }) {
  const moduleId = module.id;
  const title = module.title;
  const { data, isLoading } = useModuleContent(moduleId);
  const create = useCreateContentItem(courseId);
  const updateModule = useUpdateModule(courseId);
  const [open, setOpen] = useState(false);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: module.title,
    description: module.description,
  });
  const [form, setForm] = useState({
    title: "",
    contentType: "TEXT" as ContentType,
    description: "",
    body: "",
    externalUrl: "",
    fileId: undefined as string | undefined,
    isRequired: false,
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);

  function submit() {
    if (!form.title.trim()) return;
    create.mutate(
      {
        moduleId,
        payload: { ...form, title: form.title.trim() },
      },
      {
        onSuccess: () => {
          setForm({
            title: "",
            contentType: "TEXT",
            description: "",
            body: "",
            externalUrl: "",
            fileId: undefined,
            isRequired: false,
          });
          setFiles([]);
          setOpen(false);
        },
      }
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase">
            Module {module.position}
          </p>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditModuleOpen(true)}>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit module
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add material
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="divide-border divide-y">
          {(data?.data ?? []).map((item) => (
            <MaterialRow key={item.id} item={item} courseId={courseId} />
          ))}
          {(data?.data ?? []).length === 0 && (
            <p className="text-muted-foreground p-5 text-center text-sm">
              No materials in this module.
            </p>
          )}
        </div>
      )}

      <Dialog
        open={editModuleOpen}
        onClose={() => !updateModule.isPending && setEditModuleOpen(false)}
        title="Edit module"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditModuleOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={updateModule.isPending}
              onClick={() =>
                updateModule.mutate(
                  {
                    moduleId,
                    payload: {
                      title: moduleForm.title.trim(),
                      description: moduleForm.description.trim(),
                    },
                  },
                  { onSuccess: () => setEditModuleOpen(false) }
                )
              }
            >
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            value={moduleForm.title}
            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
            placeholder="Module title"
          />
          <Textarea
            value={moduleForm.description}
            onChange={(e) =>
              setModuleForm({ ...moduleForm, description: e.target.value })
            }
            placeholder="Module description"
            rows={3}
          />
        </div>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title={`Add material to ${title}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button onClick={submit} loading={create.isPending}>
              Create draft
            </Button>
          </>
        }
        size="lg"
      >
        <div className="space-y-4">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Material title"
          />
          <Select
            value={form.contentType}
            onChange={(e) =>
              setForm({ ...form, contentType: e.target.value as ContentType })
            }
            options={[
              { value: "TEXT", label: "Text lesson" },
              { value: "PDF", label: "PDF / document" },
              { value: "VIDEO", label: "Video" },
              { value: "AUDIO", label: "Audio" },
              { value: "LINK", label: "External link" },
              { value: "EMBED", label: "Embedded content" },
            ]}
          />
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description"
            rows={2}
          />
          {(form.contentType === "TEXT" ||
            form.contentType === "DOCUMENT" ||
            form.contentType === "PDF") && (
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Lesson content"
              rows={7}
            />
          )}
          {["PDF", "DOCUMENT", "FILE"].includes(form.contentType) && (
            <FileUploader
              files={files}
              onChange={(next) => {
                setFiles(next);
                const uploaded = next.find(
                  (file) => file.status === "done" && file.fileId
                );
                setForm({ ...form, fileId: uploaded?.fileId });
              }}
              maxFiles={1}
            />
          )}
          {["VIDEO", "AUDIO", "LINK", "EMBED"].includes(form.contentType) && (
            <Input
              value={form.externalUrl}
              onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
              className="h-4 w-4"
            />
            Required for students
          </label>
        </div>
      </Dialog>
    </Card>
  );
}

function MaterialRow({ item, courseId }: { item: ManageContentItem; courseId: string }) {
  const publish = usePublishContentItem(courseId);
  const remove = useDeleteContentItem(courseId);
  const update = useUpdateContentItem(courseId);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    title: item.title,
    contentType: item.contentType,
    description: item.description,
    body: item.body,
    externalUrl: item.externalUrl,
    isRequired: item.isRequired,
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="text-muted-foreground text-xs">{item.contentType}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.isPublished ? "success" : "default"}>
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              publish.mutate({ contentId: item.id, published: !item.isPublished })
            }
            loading={publish.isPending}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {item.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => remove.mutate(item.id)}
            loading={remove.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {item.title}</span>
          </Button>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onClose={() => !update.isPending && setEditOpen(false)}
        title="Edit material"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={update.isPending}
              onClick={() =>
                update.mutate(
                  {
                    contentId: item.id,
                    payload: { ...form, title: form.title.trim() },
                  },
                  { onSuccess: () => setEditOpen(false) }
                )
              }
            >
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Material title"
          />
          <Select
            value={form.contentType}
            onChange={(e) =>
              setForm({ ...form, contentType: e.target.value as ContentType })
            }
            options={[
              { value: "TEXT", label: "Text lesson" },
              { value: "PDF", label: "PDF / document" },
              { value: "VIDEO", label: "Video" },
              { value: "AUDIO", label: "Audio" },
              { value: "LINK", label: "External link" },
              { value: "EMBED", label: "Embedded content" },
            ]}
          />
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description"
            rows={2}
          />
          {["TEXT", "DOCUMENT", "PDF"].includes(form.contentType) && (
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Lesson content"
              rows={7}
            />
          )}
          {["VIDEO", "AUDIO", "LINK", "EMBED"].includes(form.contentType) && (
            <Input
              value={form.externalUrl}
              onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
              className="h-4 w-4"
            />
            Required for students
          </label>
        </div>
      </Dialog>
    </>
  );
}
