import { GraduationCap, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { BrandCanvas } from "@/components/layout/brand-canvas";

/**
 * Auth chrome shared by /login, /forgot-password and /reset-password.
 * BrandCanvas supplies the layered gradient, ambient glows and edge-masked
 * geometric motifs; a translucent glass card floats above it.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip px-4 py-10 sm:py-14">
      <BrandCanvas />

      {/* Brand lockup */}
      <Link
        href="/"
        aria-label="GU-LMS — home"
        className="auth-rise group relative flex flex-col items-center gap-3 text-center outline-none"
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,hsl(221_83%_53%)_0%,hsl(215_90%_60%)_52%,hsl(226_72%_44%)_100%)] shadow-[0_18px_38px_-14px_hsl(221_83%_53%/0.55)] ring-1 ring-white/40 dark:ring-white/15 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(120%_90%_at_30%_18%,rgba(255,255,255,0.45),transparent_55%)]"
          />
          <GraduationCap className="relative h-8 w-8 text-white" strokeWidth={1.6} aria-hidden />
        </div>
        <div className="space-y-0.5">
          <p className="text-[19px] font-semibold leading-6 tracking-tight">
            GU<span className="text-primary">-</span>LMS
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Gracious University
          </p>
        </div>
      </Link>

      {/* Card */}
      <div className="auth-rise auth-rise-delay-1 relative mt-7 w-full max-w-md">
        <div className="relative rounded-[1.35rem] border border-white/60 dark:border-white/10 bg-white/85 dark:bg-slate-800/75 p-6 shadow-[0_30px_70px_-32px_hsl(222_47%_22%/0.55),0_2px_6px_-2px_hsl(222_47%_22%/0.08)] ring-1 ring-primary/10 backdrop-blur-xl sm:p-8">
          {children}
        </div>
      </div>

      {/* Caption + trust row */}
      <div className="auth-rise auth-rise-delay-2 relative mt-6 flex flex-col items-center gap-2.5">
        <p className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
          Secured institutional sign-in
          <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
          <a
            href="mailto:ict@graciousuniversity.edu"
            className="transition-colors hover:text-foreground hover:underline"
          >
            ICT Service Desk
          </a>
        </p>
        <p className="text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Gracious University · Learning Management System
        </p>
      </div>
    </div>
  );
}
