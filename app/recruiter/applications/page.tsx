import Link from "next/link";
import { ApplicationList } from "@/components/recruiter/application-list";
import { getRecruiterApplications } from "@/lib/recruiter/data";

export default async function RecruiterApplicationsPage() {
  const applications = await getRecruiterApplications();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Applications queue</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">All candidates</h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-600">
                Review submissions, compare match quality, and progress candidates through the funnel.
              </p>
            </div>
            <Link href="/recruiter" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <ApplicationList applications={applications} />
        </section>
      </div>
    </main>
  );
}
