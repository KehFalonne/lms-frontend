"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  Check,
  CheckCircle2,
  CircleDashed,
  FolderOpen,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandCanvas } from "@/components/layout/brand-canvas";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { roleBasedLanding } from "@/lib/constants/routes";

const TRUST = [
  "Every faculty and level, in one place",
  "Progress synced across your devices",
  "Secured with your GU credentials",
];

const MOBILE_HIGHLIGHTS = [
  "24/7 campus access",
  "Materials · tests · grades",
  "Your progress, tracked",
];

export default function HomePage() {
  const { status, isAuthenticated, user, loadSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unknown") loadSession();
  }, [status, loadSession]);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(
        roleBasedLanding(
          user.roles,
          Boolean(user.staffProfile),
          Boolean(user.studentProfile),
          Boolean(user.isStaff)
        )
      );
    }
  }, [isAuthenticated, user, router]);

  const primaryHref = isAuthenticated
    ? roleBasedLanding(
        user?.roles ?? [],
        Boolean(user?.staffProfile),
        Boolean(user?.studentProfile),
        Boolean(user?.isStaff)
      )
    : "/login";
  const primaryLabel = isAuthenticated
    ? "Go to your dashboard"
    : "Sign in to your campus";

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <BrandCanvas />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between py-5">
          <Link
            href="/"
            className="group flex items-center gap-2.5 outline-none"
            aria-label="GU-LMS — home"
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(140deg,hsl(221_83%_53%)_0%,hsl(215_90%_60%)_52%,hsl(226_72%_44%)_100%)] shadow-[0_10px_22px_-10px_hsl(221_83%_53%/0.6)] ring-1 ring-white/40 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 dark:ring-white/15">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_18%,rgba(255,255,255,0.45),transparent_55%)]"
              />
              <GraduationCap
                className="relative h-5 w-5 text-white"
                strokeWidth={1.7}
                aria-hidden
              />
            </div>
            <span className="text-[17px] font-semibold tracking-tight">
              GU<span className="text-primary">-</span>LMS
            </span>
          </Link>

          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors"
          >
            Sign in
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </header>

        {/* Hero */}
        <div className="flex flex-1 items-center py-10 lg:py-6">
          <div className="grid w-full grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
            <div className="max-w-xl">
              <p className="auth-rise text-primary flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-primary/60 h-px w-6" />
                Gracious University · Official LMS
              </p>

              <h1 className="auth-rise auth-rise-delay-1 mt-4 text-[2.55rem] leading-[1.04] font-semibold tracking-tight sm:text-6xl">
                Every lecture.
                <br />
                Every lesson.{" "}
                <span className="relative inline-block">
                  One campus.
                  <svg
                    aria-hidden
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 220 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M4 8c60-5 150-5 212 0"
                      stroke="hsl(var(--primary))"
                      strokeOpacity="0.55"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="auth-rise auth-rise-delay-2 text-muted-foreground mt-5 max-w-md text-base leading-7">
                Course materials, assessments, feedback and your live progress — one
                secure place for every Gracious University course.
              </p>

              <div className="auth-rise auth-rise-delay-2 mt-7 flex flex-wrap items-center gap-3">
                <Link href={primaryHref}>
                  <Button size="lg" className="group">
                    {primaryLabel}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Button>
                </Link>
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors hover:underline"
                >
                  Forgot your credentials?
                </Link>
              </div>

              <ul className="auth-rise auth-rise-delay-3 mt-7 hidden flex-col gap-2 sm:flex">
                {TRUST.map((item) => (
                  <li
                    key={item}
                    className="text-muted-foreground flex items-center gap-2 text-sm"
                  >
                    <span className="bg-success/15 flex h-4.5 w-4.5 items-center justify-center rounded-full">
                      <Check
                        className="text-success h-3 w-3"
                        strokeWidth={3}
                        aria-hidden
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Compact highlights for small screens */}
              <div className="mt-7 flex flex-wrap gap-2 sm:hidden">
                {MOBILE_HIGHLIGHTS.map((item) => (
                  <span
                    key={item}
                    className="text-muted-foreground border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium"
                  >
                    <Check
                      className="text-success h-3 w-3"
                      strokeWidth={3.5}
                      aria-hidden
                    />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Product composition — snap-scroll row on mobile, floating stage on desktop */}
            <div
              aria-hidden
              className="relative -mx-5 mt-8 min-w-0 lg:mx-auto lg:mt-0 lg:w-full lg:max-w-[34rem]"
            >
              {/* dashed orbit behind the cards — desktop only */}
              <svg
                className="text-primary/25 absolute top-1/2 left-1/2 hidden h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 lg:block"
                viewBox="0 0 400 400"
                fill="none"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="185"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="2 9"
                  strokeLinecap="round"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="120"
                  stroke="currentColor"
                  strokeOpacity="0.6"
                  strokeWidth="1.2"
                />
              </svg>

              <div className="flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto scroll-smooth px-5 pb-2 lg:block lg:h-[32rem] lg:w-full lg:snap-none lg:overflow-visible lg:p-0 lg:pb-0">
                {/* Card A — weekly course view */}
                <div className="landing-float ring-primary/10 w-[min(19.5rem,85vw)] shrink-0 snap-center rounded-2xl border border-white/60 bg-white/85 p-4 shadow-[0_28px_60px_-30px_hsl(222_47%_22%/0.55)] ring-1 backdrop-blur-xl lg:absolute lg:top-2 lg:left-0 lg:w-[20rem] dark:border-white/10 dark:bg-slate-800/75">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                        <FolderOpen className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[12px] leading-4 font-semibold">
                          CS 401 · Database Systems
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[10px]">
                          Introduction to DBMS
                        </p>
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      Week 4
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    <li className="bg-success/5 flex items-center justify-between gap-2 rounded-lg px-2.5 py-2">
                      <span className="flex items-center gap-2 text-[11px] font-medium">
                        <CheckCircle2 className="text-success h-4 w-4" aria-hidden />
                        Introduction to DBMS
                      </span>
                      <span className="text-success text-[10px] font-semibold">Done</span>
                    </li>
                    <li className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2">
                      <span className="flex items-center gap-2 text-[11px] font-medium">
                        <PlayCircle className="text-primary h-4 w-4" aria-hidden />
                        Tables and Relations
                      </span>
                      <span className="text-muted-foreground text-[10px] font-semibold">
                        Reading · 90%
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2">
                      <span className="flex items-center gap-2 text-[11px] font-medium">
                        <CircleDashed
                          className="text-muted-foreground h-4 w-4"
                          aria-hidden
                        />
                        Normalization
                      </span>
                      <span className="text-muted-foreground text-[10px] font-semibold">
                        Locked
                      </span>
                    </li>
                  </ul>

                  <div className="mt-3">
                    <div className="text-muted-foreground flex items-center justify-between text-[10px] font-medium">
                      <span>Week 4 progress</span>
                      <span>68%</span>
                    </div>
                    <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "68%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pill — new materials */}
                <div className="landing-float-slow ring-border/60 flex w-max shrink-0 snap-center items-center gap-2 self-center rounded-full border border-white/60 bg-white/80 py-1.5 pr-3.5 pl-2 shadow-lg ring-1 backdrop-blur-md lg:absolute lg:top-24 lg:right-0 dark:border-white/10 dark:bg-slate-800/75">
                  <span className="bg-primary text-primary-foreground relative flex h-6 w-6 items-center justify-center rounded-full">
                    <Bell className="h-3.5 w-3.5" />
                    <span className="bg-danger absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-white">
                      3
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold">
                    3 new materials posted
                  </span>
                </div>

                {/* Card B — reading completion ring */}
                <div className="landing-float-slow ring-primary/10 w-[min(17rem,80vw)] shrink-0 snap-center rounded-2xl border border-white/60 bg-white/85 p-4 shadow-[0_28px_60px_-30px_hsl(222_47%_22%/0.55)] ring-1 backdrop-blur-xl lg:absolute lg:right-2 lg:bottom-0 lg:w-[17.5rem] dark:border-white/10 dark:bg-slate-800/75">
                  <div className="flex items-center gap-3">
                    <svg
                      viewBox="0 0 80 80"
                      className="h-20 w-20 shrink-0"
                      role="presentation"
                    >
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="9"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 31}
                        strokeDashoffset={2 * Math.PI * 31 * 0.1}
                        transform="rotate(-90 40 40)"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="17.5"
                        fill="hsl(var(--success) / 0.14)"
                      />
                      <path
                        d="M33 40.5l5 5 9.5-11"
                        fill="none"
                        stroke="hsl(var(--success))"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div>
                      <p className="text-[13px] leading-5 font-semibold">
                        Reading goal reached
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[10px]">
                        Introduction to DBMS · 90%
                      </p>
                    </div>
                  </div>
                  <div className="bg-success/5 mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-2">
                    <BookOpenCheck className="text-success h-4 w-4" aria-hidden />
                    <p className="text-success text-[10px] font-semibold">
                      Marked complete · progress saved
                    </p>
                  </div>
                </div>

                {/* Chip — required lesson */}
                <div className="landing-float border-primary/15 bg-primary/5 flex h-max w-max shrink-0 snap-center items-center gap-1.5 self-center rounded-full border py-1 pr-3 pl-2 backdrop-blur-sm lg:absolute lg:bottom-36 lg:left-2">
                  <BookOpenCheck className="text-primary h-3.5 w-3.5" aria-hidden />
                  <span className="text-primary text-[10px] font-semibold">
                    Required · 100% read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-border/60 text-muted-foreground flex flex-col gap-2 border-t py-5 text-[11px] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Gracious University · Learning Management System</p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:ict@graciousuniversity.edu"
              className="hover:text-foreground transition-colors hover:underline"
            >
              ICT Service Desk
            </a>
            <span aria-hidden className="bg-border h-1 w-1 rounded-full" />
            <Link
              href="/forgot-password"
              className="hover:text-foreground transition-colors hover:underline"
            >
              Reset password
            </Link>
            <span aria-hidden className="bg-border h-1 w-1 rounded-full" />
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="text-success h-3.5 w-3.5" aria-hidden />
              Secured sign-in
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
