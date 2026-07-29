import Link from "next/link";
import { notFound } from "next/navigation";

import { RecruiterJobForm } from "@/components/recruiter/job-form";
import { getRecruiterJobById } from "@/lib/supabase/jobs";

export default async function EditRecruiterJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await getRecruiterJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-8">
      ...
      <RecruiterJobForm
  mode="edit"
  jobId={job.id}
  initialValues={{
    title: job.title,
    department: job.department ?? "",
    location: job.location ?? "",
    employmentType: job.employment_type ?? "full-time",
    experienceLevel: job.experience_level ?? "mid",
    requiredSkills: (job.required_skills ?? []).join(", "),
    description: job.description ?? "",
    requirements: job.requirements ?? "",
    status: job.status,
  }}
/>
    </main>
  );
}