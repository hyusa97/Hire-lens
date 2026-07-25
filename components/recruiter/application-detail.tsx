import Link from "next/link";
import type { RecruiterApplicationDetail } from "@/lib/recruiter/data";

function RecommendationBadge({ recommendation }: { recommendation: string | null }) {
  if (!recommendation) {
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Pending</span>;
  }

  const tone = {
    STRONG_MATCH: "bg-emerald-50 text-emerald-700",
    GOOD_MATCH: "bg-indigo-50 text-indigo-700",
    REVIEW: "bg-amber-50 text-amber-700",
    WEAK_MATCH: "bg-rose-50 text-rose-700",
  }[recommendation] ?? "bg-slate-100 text-slate-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>{recommendation.replace(/_/g, " ")}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = {
    pending: "bg-slate-100 text-slate-700",
    reviewing: "bg-indigo-50 text-indigo-700",
    shortlisted: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  }[status] ?? "bg-slate-100 text-slate-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${tone}`}>{status}</span>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-600">{children}</div>
    </div>
  );
}

type ApplicationDetailProps = {
  application: RecruiterApplicationDetail;
  onStatusChange: (formData: FormData) => Promise<void>;
};

export function ApplicationDetailView({ application, onStatusChange }: ApplicationDetailProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Application review</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{application.candidate?.name ?? "Candidate"}</h1>
            <p className="mt-2 text-sm text-slate-600">{application.job?.title ?? "Role"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={application.status} />
            <RecommendationBadge recommendation={application.recommendation} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={onStatusChange} className="inline-flex">
            <input type="hidden" name="status" value="reviewing" />
            <button type="submit" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
              Reset to reviewing
            </button>
          </form>
          <form action={onStatusChange} className="inline-flex">
            <input type="hidden" name="status" value="shortlisted" />
            <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Shortlist
            </button>
          </form>
          <form action={onStatusChange} className="inline-flex">
            <input type="hidden" name="status" value="rejected" />
            <button type="submit" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
              Reject
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Candidate profile">
          <p><span className="font-semibold text-slate-900">Name:</span> {application.candidate?.name ?? "Unavailable"}</p>
          <p><span className="font-semibold text-slate-900">Email:</span> {application.candidate?.email ?? "Unavailable"}</p>
          <p><span className="font-semibold text-slate-900">Phone:</span> {application.candidate?.phone ?? "Not provided"}</p>
          <p><span className="font-semibold text-slate-900">Experience:</span> {application.candidate?.experience_years ?? 0} years</p>
          <p><span className="font-semibold text-slate-900">Skills:</span> {application.candidate?.skills?.join(", ") ?? "Not provided"}</p>
          <p><span className="font-semibold text-slate-900">Summary:</span> {application.candidate?.profile_summary ?? "Not provided"}</p>
          {application.candidate?.github_url ? <p><span className="font-semibold text-slate-900">GitHub:</span> <a href={application.candidate.github_url} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">{application.candidate.github_url}</a></p> : null}
          {application.candidate?.portfolio_url ? <p><span className="font-semibold text-slate-900">Portfolio:</span> <a href={application.candidate.portfolio_url} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">{application.candidate.portfolio_url}</a></p> : null}
        </Section>

        <Section title="Role details">
          <p><span className="font-semibold text-slate-900">Title:</span> {application.job?.title ?? "Unavailable"}</p>
          <p><span className="font-semibold text-slate-900">Department:</span> {application.job?.department ?? "Not specified"}</p>
          <p><span className="font-semibold text-slate-900">Location:</span> {application.job?.location ?? "Not specified"}</p>
          <p><span className="font-semibold text-slate-900">Required skills:</span> {application.job?.required_skills?.join(", ") ?? "Not specified"}</p>
          <p><span className="font-semibold text-slate-900">Applied:</span> {formatDate(application.created_at)}</p>
        </Section>
      </div>

      <Section title="AI-assisted assessment">
        {application.match_score !== null ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Match score</p>
            <p className="mt-2 text-4xl font-semibold text-slate-950">{application.match_score}%</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            AI analysis is still pending for this application.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">Recommendation:</span>
          <RecommendationBadge recommendation={application.recommendation} />
        </div>

        <p><span className="font-semibold text-slate-900">AI summary:</span> {application.ai_summary ?? "Not available yet."}</p>
        <p><span className="font-semibold text-slate-900">Matched skills:</span> {application.matched_skills?.join(", ") ?? "None recorded"}</p>
        <p><span className="font-semibold text-slate-900">Missing skills:</span> {application.missing_skills?.join(", ") ?? "None recorded"}</p>
        <p><span className="font-semibold text-slate-900">Strengths:</span> {application.strengths?.join(", ") ?? "None recorded"}</p>
        <p><span className="font-semibold text-slate-900">Concerns:</span> {application.concerns?.join(", ") ?? "None recorded"}</p>

        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          AI analysis is decision support only. Final hiring decisions remain with the recruiter.
        </p>
      </Section>

      <div className="flex justify-start">
        <Link href="/recruiter" className="text-sm font-semibold text-indigo-600 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
