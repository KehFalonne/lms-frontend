"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./button";
import type { PaginationMeta } from "@/types/api.types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages } = meta;

  // Nothing to paginate
  if (totalPages <= 1) return null;

  return (
    <div className="border-border flex items-center justify-between border-t pt-4">
      <p className="text-muted-foreground text-sm">
        Page {page} of {totalPages} · {meta.total} total
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
