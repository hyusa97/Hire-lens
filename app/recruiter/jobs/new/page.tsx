import Link from "next/link";
import { RecruiterJobForm } from "@/components/recruiter/job-form";

export default function NewRecruiterJobPage() {
  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">New role</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Create a new job posting</h1>
        </div>
        <Link href="/recruiter/jobs" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          Back to jobs
        </Link>
      </div>

      <RecruiterJobForm />
    </main>
  );
}
