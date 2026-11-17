import { AuthGate } from "@/components/layout/auth-gate";
import { MonitorContent } from "@/app/(lecturer)/lecturer/courses/[courseId]/assessments/[assessmentId]/monitor/page";

export default function InvigilatorSessionPage({
  params,
}: {
  params: Promise<{ courseId: string; assessmentId: string }>;
}) {
  return (
    <AuthGate requireStaffProfile>
      <MonitorContent params={params} />
    </AuthGate>
  );
}
