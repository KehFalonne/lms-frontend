import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CourseOfferingSummary } from "../types/course.types";

export function CourseCard({ offering }: { offering: CourseOfferingSummary }) {
  return (
    <Link href={`/courses/${offering.id}`}>
      <Card className="hover:border-primary h-full p-4 transition-all hover:shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <Badge variant="primary">{offering.course.code}</Badge>
        </div>

        <h3 className="mt-3 line-clamp-2 font-semibold">{offering.course.title}</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          {offering.semester.name} · Section {offering.section}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{offering.programme.name}</p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{offering.course.credits} credits</Badge>
          <Badge variant="outline">Level {offering.course.level}</Badge>
        </div>
      </Card>
    </Link>
  );
}
