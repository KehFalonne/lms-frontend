"use client";
import { useMemo } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { Permission } from "../types/admin.types";

interface Props {
  permissions: Permission[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
}

export function PermissionMatrix({ permissions, selected, onChange, disabled }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    permissions.forEach((p) => {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module)!.push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const toggle = (id: string) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const toggleModule = (perms: Permission[]) => {
    if (disabled) return;
    const next = new Set(selected);
    const allSelected = perms.every((p) => next.has(p.id));
    if (allSelected) perms.forEach((p) => next.delete(p.id));
    else perms.forEach((p) => next.add(p.id));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {grouped.map(([module, perms]) => {
        const count = perms.filter((p) => selected.has(p.id)).length;
        const allSelected = count === perms.length;
        return (
          <div key={module} className="border-border overflow-hidden rounded-md border">
            <div className="border-border bg-surface/60 flex items-center gap-3 border-b px-3 py-2">
              <label
                className={cn(
                  "flex flex-1 cursor-pointer items-center gap-2",
                  disabled && "cursor-not-allowed opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                    allSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  {allSelected && <Check className="h-3 w-3" />}
                </span>
                <span className="text-sm font-medium capitalize">{module}</span>
                <span className="text-muted-foreground text-xs">
                  {count}/{perms.length}
                </span>
              </label>
              <button
                onClick={() => toggleModule(perms)}
                disabled={disabled}
                className="text-primary text-xs hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="grid gap-1 p-2 sm:grid-cols-2 lg:grid-cols-3">
              {perms.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "hover:bg-surface flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-sm",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(p.id)}
                      className="mt-0.5 h-3.5 w-3.5"
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{p.name}</span>
                      <span className="text-muted-foreground block truncate font-mono text-[10px]">
                        {p.code}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
