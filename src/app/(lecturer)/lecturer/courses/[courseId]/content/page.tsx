"use client";

import { use, useEffect, useRef, useState } from "react";
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
  useAutosaveContentItem,
} from "@/features/content/hooks/useContent";
import type {
  AudioChapter,
  ContentType,
  CourseModule,
  ManageContentItem,
} from "@/features/content/types/content.types";
import { normalizeVideoUrl } from "@/features/content/utils/video-url";
import { sanitizeContentHtml } from "@/features/content/utils/content-html";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [previewOpen, setPreviewOpen] = useState(false);
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
    transcript: "",
    externalUrl: "",
    fileId: undefined as string | undefined,
    isRequired: false,
    allowDownload: true,
    chapters: [] as AudioChapter[],
    attachmentIds: [] as string[],
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<UploadedFile[]>([]);
  const [formError, setFormError] = useState("");

  function submit() {
    if (!form.title.trim()) return;
    const externalUrl =
      form.contentType === "VIDEO"
        ? normalizeVideoUrl(form.externalUrl)
        : form.externalUrl.trim();
    const uploadedFileId = files.find((file) => file.status === "done")?.fileId;
    if (form.contentType === "TEXT" && !form.body.trim()) {
      setFormError("Enter the lesson text.");
      return;
    }
    if (form.contentType === "LINK" && !externalUrl) {
      setFormError("Enter a valid HTTP(S) URL.");
      return;
    }
    if (form.contentType === "AUDIO" && !externalUrl && !uploadedFileId) {
      setFormError("Paste an audio URL or upload an audio file.");
      return;
    }
    if (form.contentType === "EMBED" && !externalUrl) {
      setFormError("Enter a valid HTTP(S) embed URL.");
      return;
    }
    if (form.contentType === "VIDEO" && !externalUrl && !uploadedFileId) {
      setFormError("Paste a video URL or upload a video file.");
      return;
    }
    if (form.contentType === "PDF" && !externalUrl && !uploadedFileId) {
      setFormError("Upload a PDF file or provide a PDF URL.");
      return;
    }
    const chapterError = validateChapters(form.chapters);
    if (chapterError) {
      setFormError(chapterError);
      return;
    }
    setFormError("");
    create.mutate(
      {
        moduleId,
        payload: {
          ...form,
          title: form.title.trim(),
          externalUrl: externalUrl ?? "",
          fileId: uploadedFileId,
          attachmentIds: attachmentFiles
            .filter((file) => file.status === "done" && file.fileId)
            .map((file) => file.fileId!),
        },
      },
      {
        onSuccess: () => {
          setForm({
            title: "",
            contentType: "TEXT",
            description: "",
            body: "",
            transcript: "",
            externalUrl: "",
            fileId: undefined,
            isRequired: false,
            allowDownload: true,
            chapters: [],
            attachmentIds: [],
          });
          setFiles([]);
          setAttachmentFiles([]);
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreviewOpen(true)}
              disabled={!form.body.trim()}
            >
              Preview
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
          {formError && <p className="text-danger text-sm">{formError}</p>}
          {(form.contentType === "TEXT" ||
            form.contentType === "DOCUMENT" ||
            form.contentType === "PDF") && (
            <RichTextEditor
              value={form.body}
              onChange={(body) => setForm({ ...form, body })}
              placeholder="Lesson content"
            />
          )}
          {form.contentType === "TEXT" && (
            <FileUploader
              files={attachmentFiles}
              onChange={setAttachmentFiles}
              maxFiles={5}
            />
          )}
          {form.contentType === "AUDIO" && (
            <div className="space-y-3">
              <Textarea
                value={form.transcript}
                onChange={(e) => setForm({ ...form, transcript: e.target.value })}
                placeholder="Optional audio transcript"
                rows={8}
              />
              <ChapterEditor
                chapters={form.chapters}
                onChange={(chapters) => setForm({ ...form, chapters })}
              />
            </div>
          )}
          {["PDF", "DOCUMENT", "FILE", "VIDEO", "AUDIO"].includes(form.contentType) && (
            <FileUploader
              files={files}
              onChange={(next) => {
                setFiles(next);
                const uploaded = next.find(
                  (file) => file.status === "done" && file.fileId
                );
                setForm({ ...form, fileId: uploaded?.fileId });
              }}
              accept={
                form.contentType === "VIDEO"
                  ? "video/mp4,video/webm,video/ogg,video/quicktime"
                  : form.contentType === "PDF"
                    ? "application/pdf"
                    : form.contentType === "AUDIO"
                      ? "audio/*"
                    : undefined
              }
              maxFiles={1}
            />
          )}
          {["VIDEO", "AUDIO", "PDF", "LINK", "EMBED"].includes(form.contentType) && (
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
          {form.contentType === "AUDIO" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.allowDownload}
                onChange={(e) => setForm({ ...form, allowDownload: e.target.checked })}
                className="h-4 w-4"
              />
              Allow students to download audio
            </label>
          )}
        </div>
      </Dialog>
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={form.title.trim() || "Lesson preview"}
        size="lg"
      >
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">Student preview</p>
          <div
            className="lesson-document lesson-content"
            dangerouslySetInnerHTML={{
              __html: sanitizeContentHtml(form.body || "<p>No lesson content yet.</p>"),
            }}
          />
        </div>
      </Dialog>
    </Card>
  );
}

function ChapterEditor({
  chapters,
  onChange,
}: {
  chapters: AudioChapter[];
  onChange: (chapters: AudioChapter[]) => void;
}) {
  return (
    <div className="border-border space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Audio chapters</p>
          <p className="text-muted-foreground text-xs">Start times are in seconds.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            const previousStart = chapters.at(-1)?.startSeconds ?? -1;
            onChange([
              ...chapters,
              { title: "", startSeconds: Math.max(0, previousStart + 1) },
            ]);
          }}
        >
          Add chapter
        </Button>
      </div>
      {chapters.map((chapter, index) => (
        <div key={`${index}-${chapter.title}`} className="flex items-end gap-2">
          <Input
            value={chapter.title}
            onChange={(event) => {
              const next = [...chapters];
              next[index] = { ...chapter, title: event.target.value };
              onChange(next);
            }}
            placeholder={`Chapter ${index + 1}`}
          />
          <Input
            type="number"
            min={0}
            step={1}
            value={chapter.startSeconds}
            onChange={(event) => {
              const next = [...chapters];
              next[index] = {
                ...chapter,
                startSeconds: Math.max(0, Number(event.target.value) || 0),
              };
              onChange(next);
            }}
            className="w-28"
            aria-label={`${chapter.title || `Chapter ${index + 1}`} start time in seconds`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(chapters.filter((_, itemIndex) => itemIndex !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

function validateChapters(chapters: AudioChapter[]): string | null {
  let previousStart = -1;
  for (const [index, chapter] of chapters.entries()) {
    if (!chapter.title.trim()) {
      return `Enter a title for chapter ${index + 1}.`;
    }
    if (chapter.startSeconds < 0 || chapter.startSeconds <= previousStart) {
      return "Chapter start times must be increasing. Set each chapter after the previous one.";
    }
    previousStart = chapter.startSeconds;
  }
  return null;
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function format(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div className="space-y-2">
      <div className="border-border bg-muted/30 flex flex-wrap gap-1 rounded-t-md border border-b-0 p-2">
        {[
          ["Bold", "bold"],
          ["Italic", "italic"],
          ["Underline", "underline"],
          ["Heading", "formatBlock", "<h3>"],
          ["Quote", "formatBlock", "<blockquote>"],
          ["Bullet list", "insertUnorderedList"],
          ["Numbered list", "insertOrderedList"],
          ["Clear formatting", "removeFormat"],
        ].map(([label, command, commandValue]) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant="ghost"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => format(command, commandValue)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={placeholder}
        data-placeholder={placeholder}
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="lesson-content border-border bg-background min-h-[420px] w-full resize-y rounded-b-md border px-4 py-3 text-sm outline-none focus-within:ring-2 focus-within:ring-primary"
      />
      <p className="text-muted-foreground text-xs">
        Type your lesson, select text, then choose a formatting button.
      </p>
    </div>
  );
}

function MaterialRow({ item, courseId }: { item: ManageContentItem; courseId: string }) {
  const publish = usePublishContentItem(courseId);
  const remove = useDeleteContentItem(courseId);
  const update = useUpdateContentItem(courseId);
  const autosave = useAutosaveContentItem(courseId);
  const [editOpen, setEditOpen] = useState(false);
  const [editPreviewOpen, setEditPreviewOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    title: item.title,
    contentType: item.contentType,
    description: item.description,
    body: item.body,
    transcript: item.transcript ?? "",
    externalUrl: item.externalUrl,
    allowDownload: item.allowDownload ?? true,
    chapters: item.chapters ?? [],
    attachmentIds: item.attachmentIds ?? [],
    fileId: item.fileId ?? undefined,
    fileName: item.fileName,
    fileSizeBytes: item.fileSizeBytes,
    fileMimeType: item.fileMimeType,
    audioVersions: item.audioVersions,
    pdfAccessibilityWarning: item.pdfAccessibilityWarning,
    pdfVersions: item.pdfVersions,
    isRequired: item.isRequired,
  });
  const autosaveSnapshot = useDebounce(
    JSON.stringify({ title: form.title, description: form.description, body: form.body }),
    1500
  );
  const autosaveInitialized = useRef(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    if (!autosaveInitialized.current) {
      autosaveInitialized.current = true;
      return;
    }
    if (!editOpen || item.isPublished || form.contentType !== "TEXT") return;
    const snapshot = JSON.parse(autosaveSnapshot) as {
      title: string;
      description: string;
      body: string;
    };
    if (!snapshot.title.trim() || !snapshot.body.trim()) return;
    autosave.mutate(
      { contentId: item.id, payload: snapshot },
      { onSuccess: () => setAutosaveStatus("saved") }
    );
  }, [autosaveSnapshot, editOpen]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<UploadedFile[]>([]);

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
                (() => {
                  const externalUrl =
                    form.contentType === "VIDEO"
                      ? normalizeVideoUrl(form.externalUrl)
                      : form.externalUrl.trim();
                  if (form.contentType === "TEXT" && !form.body.trim()) {
                    setFormError("Enter the lesson text.");
                    return;
                  }
                  if (form.contentType === "LINK" && !externalUrl) {
                    setFormError("Enter a valid HTTP(S) URL.");
                    return;
                  }
                  const uploadedFileId = files.find(
                    (file) => file.status === "done"
                  )?.fileId;
                  if (
                    form.contentType === "AUDIO" &&
                    !externalUrl &&
                    !uploadedFileId &&
                    !form.fileId
                  ) {
                    setFormError("Paste an audio URL or upload an audio file.");
                    return;
                  }
                  if (
                    form.contentType === "PDF" &&
                    !form.externalUrl.trim() &&
                    !uploadedFileId &&
                    !form.fileId
                  ) {
                    setFormError("Upload a PDF file or provide a PDF URL.");
                    return;
                  }
                  const chapterError = validateChapters(form.chapters);
                  if (chapterError) {
                    setFormError(chapterError);
                    return;
                  }
                  setFormError("");
                  if (
                    form.contentType === "PDF" &&
                    form.fileId !== item.fileId &&
                    !window.confirm(
                      "Replace this published PDF? Existing student completion history will be preserved."
                    )
                  ) {
                    return;
                  }
                  update.mutate(
                    {
                      contentId: item.id,
                      payload: {
                        ...form,
                        title: form.title.trim(),
                        externalUrl: externalUrl ?? "",
                        fileId: uploadedFileId ?? form.fileId,
                        attachmentIds: [
                          ...form.attachmentIds,
                          ...attachmentFiles
                            .filter((file) => file.status === "done" && file.fileId)
                            .map((file) => file.fileId!),
                        ],
                      },
                    },
                    { onSuccess: () => setEditOpen(false) }
                  );
                })()
              }
            >
              Save changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditPreviewOpen(true)}
              disabled={!form.body.trim()}
            >
              Preview
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
          {formError && <p className="text-danger text-sm">{formError}</p>}
          {form.contentType === "TEXT" && !item.isPublished && autosaveStatus === "saved" && (
            <p className="text-success text-xs">Draft saved automatically.</p>
          )}
          {["TEXT", "DOCUMENT", "PDF"].includes(form.contentType) && (
            <RichTextEditor
              value={form.body}
              onChange={(body) => setForm({ ...form, body })}
              placeholder="Lesson content"
            />
          )}
          {(form.contentType === "VIDEO" || form.contentType === "AUDIO") && (
            <>
            {form.contentType === "AUDIO" && form.fileId && (
              <div className="border-border rounded-md border p-3 text-sm">
                <p className="font-medium">Current audio</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {form.fileName ?? "Uploaded audio"}
                  {form.fileSizeBytes
                    ? ` · ${(form.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                    : ""}
                </p>
                {form.audioVersions && form.audioVersions.length > 0 && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    Previous versions: {form.audioVersions.length}
                  </p>
                )}
              </div>
            )}
            <FileUploader
              files={files}
              onChange={(next) => {
                setFiles(next);
                const uploaded = next.find(
                  (file) => file.status === "done" && file.fileId
                );
                if (uploaded?.fileId) setForm({ ...form, fileId: uploaded.fileId });
              }}
              accept={
                form.contentType === "AUDIO"
                  ? "audio/*"
                  : "video/mp4,video/webm,video/ogg,video/quicktime"
              }
              maxFiles={1}
            />
            </>
          )}
          {form.contentType === "PDF" && (
            <>
              {form.fileId && (
                <div className="border-border flex items-center justify-between rounded-md border p-3 text-sm">
                  <div>
                    <p className="font-medium">{form.fileName ?? "Current PDF"}</p>
                    {form.fileSizeBytes && (
                      <p className="text-muted-foreground text-xs">
                        {(form.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                    {form.pdfAccessibilityWarning && (
                      <p className="text-warning bg-warning/10 rounded-md p-3 text-xs">
                        {form.pdfAccessibilityWarning}
                      </p>
                    )}
                    {form.pdfVersions && form.pdfVersions.length > 0 && (
                      <div className="text-muted-foreground text-xs">
                        Previous versions: {form.pdfVersions.length}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm({ ...form, fileId: undefined, fileName: undefined })
                    }
                  >
                    Replace PDF
                  </Button>
                </div>
              )}
              {!form.fileId && (
                <FileUploader
                  files={files}
                  onChange={(next) => {
                    setFiles(next);
                    const uploaded = next.find(
                      (file) => file.status === "done" && file.fileId
                    );
                    if (uploaded?.fileId)
                      setForm({
                        ...form,
                        fileId: uploaded.fileId,
                        fileName: uploaded.name,
                        fileSizeBytes: uploaded.size,
                      });
                  }}
                  accept="application/pdf"
                  maxFiles={1}
                />
              )}
            </>
          )}
          {form.contentType === "AUDIO" && (
            <ChapterEditor
              chapters={form.chapters}
              onChange={(chapters) => setForm({ ...form, chapters })}
            />
          )}
          {form.contentType === "TEXT" && (
            <FileUploader
              files={attachmentFiles}
              onChange={setAttachmentFiles}
              maxFiles={5}
            />
          )}
          {["VIDEO", "AUDIO", "PDF", "LINK", "EMBED"].includes(form.contentType) && (
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
          {form.contentType === "AUDIO" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.allowDownload}
                onChange={(e) => setForm({ ...form, allowDownload: e.target.checked })}
                className="h-4 w-4"
              />
              Allow students to download audio
            </label>
          )}
        </div>
      </Dialog>
      <Dialog
        open={editPreviewOpen}
        onClose={() => setEditPreviewOpen(false)}
        title={form.title.trim() || "Lesson preview"}
        size="lg"
      >
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">Student preview</p>
          <div
            className="lesson-document lesson-content"
            dangerouslySetInnerHTML={{
              __html: sanitizeContentHtml(form.body || "<p>No lesson content yet.</p>"),
            }}
          />
        </div>
      </Dialog>
    </>
  );
}
