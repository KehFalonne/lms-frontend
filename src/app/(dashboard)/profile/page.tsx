"use client";
import { useRef, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  GraduationCap,
  Hash,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AuthGate } from "@/components/layout/auth-gate";
import { GlassCard, PanelHeader, TONE_CHIP } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { primaryRoleLabel } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { uploadFile } from "@/features/files/api/files.api";

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileContent />
    </AuthGate>
  );
}

function ProfileContent() {
  const { user, updateAvatar } = useAuth();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  if (!user) return null;

  const handleAvatarChange = async (file: File) => {
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Profile pictures must be 5 MB or smaller.");
      return;
    }
    setAvatarUploading(true);
    try {
      const fileId = await uploadFile(file, undefined, "profiles");
      await updateAvatar(fileId);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const memberSince = new Date(user.createdAt).getFullYear();
  const statusTone =
    user.status?.toUpperCase() === "ACTIVE"
      ? "bg-success/10 text-success ring-success/25"
      : "bg-warning/10 text-warning ring-warning/25";

  return (
    <div>
      {/* Library header */}
      <header className="mb-5 sm:mb-6">
        <p className="text-primary flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
          <span aria-hidden className="bg-primary/50 h-px w-6" />
          My account
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">
          Your identity across the campus — records used for enrolment, results and
          communication.
        </p>
      </header>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-3">
        {/* ── Identity card ─────────────────────────────── */}
        <GlassCard className="relative overflow-hidden p-6 text-center sm:p-7">
          {/* decorative wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,hsl(221_83%_53%/0.14),transparent)] blur-xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,hsl(199_89%_48%/0.12),transparent)] blur-xl"
          />

          <div className="relative">
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(140deg,hsl(221_83%_53%)_0%,hsl(215_90%_60%)_52%,hsl(226_72%_44%)_100%)] shadow-[0_18px_38px_-14px_hsl(221_83%_53%/0.55)]"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="focus-visible:ring-primary relative rounded-[1.85rem] outline-none focus-visible:ring-2"
                aria-label="Change profile picture"
              >
                <Avatar
                  size="lg"
                  fallback={initials}
                  src={user.avatar || null}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="relative h-[6.35rem] w-[6.35rem] rounded-[1.85rem] text-2xl"
                />
                <span className="absolute inset-x-1 bottom-1 rounded-lg bg-black/60 px-1 py-1 text-[9px] font-semibold text-white">
                  {avatarUploading ? "Uploading..." : "Change"}
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void handleAvatarChange(file);
                }}
              />
            </div>
            {avatarError && (
              <p className="text-danger mt-2 text-xs" role="alert">
                {avatarError}
              </p>
            )}

            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {user.firstName} {user.middleName ? `${user.middleName} ` : ""}
              {user.lastName}
            </h2>
            <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1.5 text-sm">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {user.email}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {user.roles.length > 0 ? (
                user.roles.map((r) => (
                  <span
                    key={r}
                    className="bg-primary/10 text-primary ring-primary/20 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-widest uppercase ring-1"
                  >
                    {r.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-widest uppercase">
                  No role assigned
                </span>
              )}
            </div>

            <div className="border-border/60 text-muted-foreground mt-5 flex items-center justify-center gap-4 border-t pt-4 text-[10px] font-semibold tracking-[0.16em] uppercase">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1",
                  statusTone
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {user.status ?? "Active"}
              </span>
              {Number.isFinite(memberSince) && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  Since {memberSince}
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* ── Records ───────────────────────────────────── */}
        <div className="space-y-4 sm:space-y-5 lg:col-span-2">
          {/* Academic / staff record */}
          <GlassCard>
            <PanelHeader
              icon={user.studentProfile ? GraduationCap : Briefcase}
              tone="primary"
              title={user.studentProfile ? "Academic record" : "Staff record"}
            />
            <div className="divide-border/70 divide-y px-5 pb-5">
              {user.studentProfile ? (
                <>
                  <FactRow
                    icon={Hash}
                    tone="primary"
                    label="Matricule"
                    value={user.studentProfile.matriculeNumber}
                  />
                  <FactRow
                    icon={GraduationCap}
                    tone="success"
                    label="Current level"
                    value={`${user.studentProfile.currentLevel} Level`}
                  />
                  <FactRow
                    icon={CalendarDays}
                    tone="info"
                    label="Admission year"
                    value={String(user.studentProfile.admissionYear)}
                  />
                  <FactRow
                    icon={ShieldCheck}
                    tone="warning"
                    label="Enrolment status"
                    value={user.studentProfile.status ?? "Active"}
                  />
                </>
              ) : (
                <>
                  <FactRow
                    icon={Hash}
                    tone="primary"
                    label="Staff number"
                    value={user.staffProfile?.staffNumber ?? "—"}
                  />
                  <FactRow
                    icon={Briefcase}
                    tone="success"
                    label="Job title"
                    value={user.staffProfile?.jobTitle ?? "—"}
                  />
                  <FactRow
                    icon={ShieldCheck}
                    tone="warning"
                    label="Status"
                    value={user.status ?? "Active"}
                  />
                </>
              )}
            </div>
          </GlassCard>

          {/* Contact & login */}
          <GlassCard>
            <PanelHeader icon={UserRound} tone="info" title="Contact & login" />
            <div className="divide-border/70 divide-y px-5 pb-5">
              <FactRow
                icon={Hash}
                tone="info"
                label="University ID"
                value={user.universityId}
                mono
              />
              <FactRow icon={Mail} tone="primary" label="Email" value={user.email} />
              {user.phone && (
                <FactRow icon={Phone} tone="success" label="Phone" value={user.phone} />
              )}
              <FactRow
                icon={CalendarDays}
                tone="warning"
                label="Member since"
                value={new Date(user.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function FactRow({
  icon: Icon,
  tone,
  label,
  value,
  mono = false,
}: {
  icon: typeof Hash;
  tone: keyof typeof TONE_CHIP;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
          TONE_CHIP[tone]
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-muted-foreground min-w-0 flex-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </span>
      <span
        className={cn(
          "max-w-[58%] truncate text-right text-xs leading-5 font-semibold",
          mono && "tabular-nums"
        )}
      >
        {value}
      </span>
    </div>
  );
}
