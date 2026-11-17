import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Official GU-LMS mark — gradient squircle with inner highlight,
 * matching the landing and auth brand lockups.
 */
export function BrandMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "sm" ? "h-7 w-7 rounded-lg" : size === "lg" ? "h-12 w-12 rounded-2xl" : "h-9 w-9 rounded-xl";
  const icon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center bg-[linear-gradient(140deg,hsl(221_83%_53%)_0%,hsl(215_90%_60%)_52%,hsl(226_72%_44%)_100%)] shadow-[0_10px_22px_-10px_hsl(221_83%_53%/0.6)] ring-1 ring-white/40 dark:ring-white/15",
        dims,
        className,
      )}
      aria-hidden
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(120%_90%_at_30%_18%,rgba(255,255,255,0.45),transparent_55%)]"
        aria-hidden
      />
      <GraduationCap className={cn("relative text-white", icon)} strokeWidth={1.7} />
    </span>
  );
}
