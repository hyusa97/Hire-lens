import Link from "next/link";
import { ApplicationForm } from "@/components/jobs/application-form";
import { getActiveJobByIdOrThrow } from "@/lib/supabase/jobs";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getActiveJobByIdOrThrow(id);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8faff_0%,#ffffff_100%)] text-slate-900">
      <main className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-20">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Back to role
        </Link>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Apply now</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            You are applying for {job.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Share your experience, skills, and summary so the team can assess your fit for this opportunity.
          </p>
        </div>

        <div className="mt-8">
          <ApplicationForm jobId={job.id} jobTitle={job.title} />
        </div>
      </main>
    </div>
  );
}

