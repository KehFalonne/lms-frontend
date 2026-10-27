"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useCreateCalendarEvent } from "../hooks/useCalendar";
import { useAuthStore } from "@/stores/auth.store";
import { LECTURER_ROLES, ADMIN_ROLES } from "@/lib/constants/routes";
import type { CalendarEventType } from "../types/calendar.types";

interface Props {
  defaultDate?: Date;
}

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: "LECTURE", label: "Lecture" },
  { value: "MEETING", label: "Meeting" },
  { value: "EXAM", label: "Exam" },
  { value: "QUIZ", label: "Quiz" },
  { value: "OTHER", label: "Other" },
];

export function CreateEventDialog({ defaultDate }: Props) {
  const user = useAuthStore((s) => s.user);
  const create = useCreateCalendarEvent();
  const [open, setOpen] = useState(false);

  const canCreate =
    !!user &&
    (user.roles.some((r) => (LECTURER_ROLES as readonly string[]).includes(r)) ||
      user.roles.some((r) => (ADMIN_ROLES as readonly string[]).includes(r)));

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventType: "OTHER" as CalendarEventType,
    startAt: defaultStart(defaultDate),
    endAt: defaultEnd(defaultDate),
    location: "",
    isAllDay: false,
  });
  const [error, setError] = useState<string | null>(null);

  if (!canCreate) return null;

  const onSubmit = () => {
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.startAt || !form.endAt) {
      setError("Start and end times are required.");
      return;
    }
    if (new Date(form.startAt) >= new Date(form.endAt)) {
      setError("End must be after start.");
      return;
    }

    create.mutate(
      {
        title: form.title.trim(),
        description: form.description,
        eventType: form.eventType,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        isAllDay: form.isAllDay,
        location: form.location,
        courseOfferingId: null,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({
            title: "",
            description: "",
            eventType: "OTHER",
            startAt: defaultStart(defaultDate),
            endAt: defaultEnd(defaultDate),
            location: "",
            isAllDay: false,
          });
        },
      }
    );
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" />
        New event
      </Button>

      <Dialog
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title="New event"
        description="Personal events appear on your calendar."
        size="lg"
        locked={create.isPending}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={create.isPending}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Title <span className="text-danger">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Office hours"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Type</label>
            <Select
              value={form.eventType}
              onChange={(e) =>
                setForm({ ...form, eventType: e.target.value as CalendarEventType })
              }
              options={EVENT_TYPES}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isAllDay}
              onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })}
              className="h-4 w-4"
            />
            All day
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Start <span className="text-danger">*</span>
              </label>
              <Input
                type={form.isAllDay ? "date" : "datetime-local"}
                value={form.isAllDay ? form.startAt.split("T")[0] : form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                End <span className="text-danger">*</span>
              </label>
              <Input
                type={form.isAllDay ? "date" : "datetime-local"}
                value={form.isAllDay ? form.endAt.split("T")[0] : form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Location</label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Room 3B"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && (
            <p className="border-danger/30 bg-danger/10 text-danger rounded-md border px-3 py-2 text-sm">
              {error}
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
}

function defaultStart(date?: Date): string {
  const d = date ?? new Date();
  const next = new Date(d);
  next.setHours(9, 0, 0, 0);
  return toLocalInput(next);
}

function defaultEnd(date?: Date): string {
  const d = date ?? new Date();
  const next = new Date(d);
  next.setHours(10, 0, 0, 0);
  return toLocalInput(next);
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
