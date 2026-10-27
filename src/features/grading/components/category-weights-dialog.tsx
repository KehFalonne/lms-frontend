"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGradeCategories, useSetCategoryWeights } from "../hooks/useGrades";
import type { CategoryWeightInput } from "../types/grading.types";

interface Props {
  open: boolean;
  onClose: () => void;
  offeringId: string;
}

export function CategoryWeightsDialog({ open, onClose, offeringId }: Props) {
  const { data, isLoading } = useGradeCategories(open ? offeringId : null);
  const save = useSetCategoryWeights(offeringId);

  const [rows, setRows] = useState<CategoryWeightInput[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.data && open) {
      setRows(data.data.map((c) => ({ name: c.name, weight: c.weight })));
      setError(null);
    }
  }, [data, open]);

  const total = rows.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);
  const valid = Math.abs(total - 100) < 0.01 && rows.length > 0;

  const onSubmit = () => {
    if (!valid) {
      setError(`Weights must sum to 100%. Currently: ${total}%`);
      return;
    }
    if (rows.some((r) => !r.name.trim())) {
      setError("All categories need a name.");
      return;
    }
    setError(null);
    save.mutate(rows, { onSuccess: onClose });
  };

  return (
    <Dialog
      open={open}
      onClose={() => !save.isPending && onClose()}
      title="Grade Categories"
      description="Category weights must sum to 100%."
      size="lg"
      locked={save.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={save.isPending} disabled={!valid}>
            Save weights
          </Button>
        </>
      }
    >
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_100px_40px] gap-2">
            <span className="text-muted-foreground text-xs font-medium uppercase">
              Category
            </span>
            <span className="text-muted-foreground text-xs font-medium uppercase">
              Weight %
            </span>
            <span />
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_40px] gap-2">
              <Input
                value={r.name}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...next[i], name: e.target.value };
                  setRows(next);
                }}
                placeholder="e.g. Assignments"
              />
              <Input
                type="number"
                step="0.01"
                value={r.weight}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...next[i], weight: e.target.value };
                  setRows(next);
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setRows([...rows, { name: "", weight: "0" }])}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add category
          </Button>

          <div
            className={`mt-2 rounded-md border p-3 text-sm ${
              valid
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/30 bg-warning/10 text-warning"
            }`}
          >
            Total: {total.toFixed(2)}% {valid ? "✓" : "(must be 100%)"}
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}
        </div>
      )}
    </Dialog>
  );
}
