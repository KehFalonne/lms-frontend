"use client";
import { cn } from "@/lib/utils/cn";

export interface ResponsiveColumn<T> {
  key: string;
  header: string;
  /** Render for desktop table cell. */
  cell: (row: T) => React.ReactNode;
  /** Render for mobile card (defaults to `cell`). */
  mobileCell?: (row: T) => React.ReactNode;
  /** Hide on mobile card. */
  hideOnMobile?: boolean;
  className?: string;
  align?: "left" | "right" | "center";
}

interface ResponsiveTableProps<T> {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function ResponsiveTable<T>({
  columns,
  rows,
  keyExtractor,
  emptyMessage = "No data.",
  onRowClick,
}: ResponsiveTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <ul className="space-y-2 md:hidden">
        {rows.map((row) => (
          <li
            key={keyExtractor(row)}
            className={cn(
              "border-border bg-background rounded-md border p-3",
              onRowClick && "hover:bg-surface cursor-pointer"
            )}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-3 py-1">
                  <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {c.header}
                  </span>
                  <span className="text-right text-sm">
                    {c.mobileCell ? c.mobileCell(row) : c.cell(row)}
                  </span>
                </div>
              ))}
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-border bg-surface/60 border-b">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "text-muted-foreground h-10 px-4 text-left text-xs font-medium tracking-wider uppercase",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {rows.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={cn(
                  "hover:bg-surface/50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3 align-middle",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.className
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
