import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GradeBadge, percentageBadgeVariant } from "./grade-badge";
import type { CourseFinalGrade } from "../types/grading.types";

export function FinalGradeCard({ grade }: { grade: CourseFinalGrade }) {
  const pct = Number(grade.percentage);

  return (
    <Link href={`/courses/${grade.courseOfferingId}/grades`}>
      <Card className="hover:border-primary p-5 transition-all hover:shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="primary">{grade.courseCode}</Badge>
              <Badge variant="outline">{grade.semester}</Badge>
            </div>
            <h3 className="font-semibold">{grade.courseTitle}</h3>

            {grade.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {grade.categories.map((c) => (
                  <Badge key={c.category} variant="outline">
                    {c.category} · {Number(c.average).toFixed(0)}%
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold">{pct.toFixed(1)}%</p>
            <div className="mt-1">
              <GradeBadge letter={grade.letterGrade} />
            </div>
            <ChevronRight className="text-muted-foreground mt-2 ml-auto h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
