"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "./button";
import { cn } from "@/lib/utils/cn";
import {
  acquireBodyScrollLock,
  releaseBodyScrollLock,
} from "@/lib/utils/body-scroll-lock";

type DialogSize = "sm" | "md" | "lg" | "xl";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  locked?: boolean;
}

const SIZES: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

/** Focusable selector — prefer form fields, fall back to buttons/links. */
const FIELD_SELECTOR =
  'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  locked = false,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Keep latest props in refs so the focus effect doesn't need them as deps.
  const onCloseRef = useRef(onClose);
  const lockedRef = useRef(locked);
  onCloseRef.current = onClose;
  lockedRef.current = locked;

  // ── Focus management: runs ONLY when `open` changes ────────────
  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement | null;
    acquireBodyScrollLock();

    // Focus the first form field if any (skip the X close button when
    // we can). Fall back to the panel itself.
    const focusTimer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const field = panel.querySelector<HTMLElement>(FIELD_SELECTOR);
      const anyFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (field ?? anyFocusable ?? panel).focus();
    }, 0);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lockedRef.current) {
        onCloseRef.current();
        return;
      }

      // Focus trap for Tab / Shift+Tab
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;

        const elements = Array.from(
          panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute("disabled"));

        if (elements.length === 0) {
          e.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first || !panel.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !panel.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      releaseBodyScrollLock();
      clearTimeout(focusTimer);
      previousFocus.current?.focus();
    };
  }, [open]); // ← ONLY `open` — this is the fix

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
      aria-describedby={description ? "dialog-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="animate-fade-in absolute inset-0 bg-black/50"
        onClick={locked ? undefined : () => onCloseRef.current()}
        aria-hidden
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "animate-slide-in border-border bg-background relative w-full border shadow-xl focus:outline-none",
          "max-h-[92vh] overflow-y-auto rounded-lg",
          "sm:max-h-[85vh]",
          (size === "lg" || size === "xl") &&
            "max-sm:h-[95vh] max-sm:max-h-[95vh] max-sm:self-end max-sm:rounded-t-2xl max-sm:rounded-b-none",
          SIZES[size]
        )}
      >
        {(title || description) && (
          <div className="border-border bg-background sticky top-0 z-10 border-b p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {title && (
                  <h2 id="dialog-title" className="text-lg font-semibold">
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="dialog-description"
                    className="text-muted-foreground mt-1 text-sm"
                  >
                    {description}
                  </p>
                )}
              </div>
              {!locked && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCloseRef.current()}
                  aria-label="Close"
                  className="-mt-2 -mr-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="p-5">{children}</div>

        {footer && (
          <div className="border-border bg-background sticky bottom-0 flex justify-end gap-2 border-t p-3 sm:p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
