import Link from "next/link";
import { JobSearch } from "@/components/jobs/job-search";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getActiveJobs } from "@/lib/supabase/jobs";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getActiveJobs();

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f8faff_0%,#ffffff_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-16 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Public roles
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Discover active opportunities.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Browse current openings, compare role fit, and take the next step with a clearer hiring journey.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Open positions</h2>
              <p className="mt-1 text-sm text-slate-600">
                Showing {jobs.length} active role{jobs.length === 1 ? "" : "s"}.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Back to home
            </Link>
          </div>

          <div className="mt-8">
            {jobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">No active roles right now</h3>
                <p className="mt-2 text-sm text-slate-600">
                  New opportunities will appear here as soon as they are published.
                </p>
              </div>
            ) : (
              <JobSearch jobs={jobs} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
