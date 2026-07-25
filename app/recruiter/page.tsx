import Link from "next/link";
import { StatCard } from "@/components/recruiter/stat-card";
import { ApplicationList } from "@/components/recruiter/application-list";
import { getRecruiterDashboardData } from "@/lib/recruiter/data";

export const dynamic = "force-dynamic";

export default async function RecruiterDashboardPage() {
  const dashboard = await getRecruiterDashboardData();

  return (
    <main className="flex flex-col gap-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Recruiter workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">HireLens hiring overview</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Review candidates, track application health, and move strong prospects forward with confidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/recruiter/jobs/new" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Create Job
            </Link>
            <Link href="/recruiter/jobs" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
              Manage Jobs
            </Link>
            <Link href="/recruiter/applications" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
              View Applications
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total applications" value={dashboard.totalApplications} description="All candidates submitted across active roles" />
        <StatCard label="Shortlisted" value={dashboard.shortlistedCount} description="Applicants marked as strong fits" />
        <StatCard label="Pending review" value={dashboard.pendingReviewCount} description="Needs attention from the hiring team" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Recent activity</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Latest applications</h2>
          </div>
          <Link href="/recruiter/applications" className="text-sm font-semibold text-indigo-600 hover:underline">
            Open full queue
          </Link>
        </div>
        <div className="mt-8">
          <ApplicationList applications={dashboard.recentApplications} />
        </div>
      </section>
    </main>
  );
}
