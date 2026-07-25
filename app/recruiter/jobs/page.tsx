import Link from "next/link";
import { getRecruiterJobs, type RecruiterJobSummary } from "@/lib/supabase/jobs";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const tone = {
    active: "bg-emerald-50 text-emerald-700",
    closed: "bg-slate-100 text-slate-700",
    draft: "bg-amber-50 text-amber-700",
  }[status] ?? "bg-slate-100 text-slate-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${tone}`}>{status}</span>;
}

export default async function RecruiterJobsPage() {
  let jobs: RecruiterJobSummary[] = [];
  let errorMessage: string | null = null;

  try {
    jobs = await getRecruiterJobs();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unable to load jobs right now.";
  }

  return (
    <main className="flex flex-col gap-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Jobs management</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Recruiter job board</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Create and review roles from one place. Active opportunities publish automatically to the public jobs page.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/recruiter/jobs/new" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Create Job
            </Link>
            <Link href="/recruiter" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {!errorMessage && jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No jobs yet</h2>
            <p className="mt-2 text-sm text-slate-600">Create your first role to start attracting candidates.</p>
          </div>
        ) : null}

        {!errorMessage && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{job.application_count} applications</span>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-950">{job.title}</h2>
                    <p className="text-sm text-slate-600">{job.department ?? "No department"} / {job.location ?? "Location TBD"}</p>
                  </div>
                  <div className="flex flex-col gap-3 text-sm text-slate-600 sm:items-end">
                    <div>
                      <p><span className="font-semibold text-slate-900">Type:</span> {job.employment_type ?? "Not specified"}</p>
                      <p><span className="font-semibold text-slate-900">Experience:</span> {job.experience_level ?? "Not specified"}</p>
                    </div>
                    {job.status === "active" ? (
                      <Link href={`/jobs/${job.id}`} className="text-sm font-semibold text-indigo-600 hover:underline">
                        View public posting
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
