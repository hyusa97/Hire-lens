import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getActiveJobByIdOrThrow } from "@/lib/supabase/jobs";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getActiveJobByIdOrThrow(id);

  return {
    title: `${job.title} | HireLens`,
    description: job.description ?? `View the ${job.title} role at HireLens.`,
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getActiveJobByIdOrThrow(id);

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f8faff_0%,#ffffff_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 lg:px-8 lg:py-20">
        <Link
          href="/jobs"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Back to jobs
        </Link>

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
              {job.department ?? "General"}
            </span>
            <span>{job.location ?? "Remote"}</span>
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {job.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {job.employment_type ?? "Full time"}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {job.experience_level ?? "Mid level"}
            </span>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">About the role</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-8 text-slate-600">
                {job.description ?? "A compelling opportunity with room to grow."}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Key details</h2>
              <dl className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <dt className="font-medium text-slate-900">Department</dt>
                  <dd className="mt-1">{job.department ?? "General"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Location</dt>
                  <dd className="mt-1">{job.location ?? "Remote"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Employment type</dt>
                  <dd className="mt-1">{job.employment_type ?? "Full time"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Experience level</dt>
                  <dd className="mt-1">{job.experience_level ?? "Mid level"}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900">Requirements</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-8 text-slate-600">
              {job.requirements ?? "A strong track record and a collaborative mindset."}
            </p>
          </div>

          {job.required_skills && job.required_skills.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-slate-900">Required skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href={`/jobs/${job.id}/apply`}
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Apply Now
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Browse more roles
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
