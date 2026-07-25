import Link from "next/link";
import type { RecruiterApplicationSummary } from "@/lib/recruiter/data";

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
  return new Date(value).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

export function ApplicationList({ applications }: { applications: RecruiterApplicationSummary[] }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
        No applications have been submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={application.status} />
                <RecommendationBadge recommendation={application.recommendation} />
              </div>
              <h3 className="text-lg font-semibold text-slate-950">
                <Link href={`/recruiter/applications/${application.id}`} className="transition hover:text-indigo-700">
                  {application.candidate_name ?? "Unnamed candidate"}
                </Link>
              </h3>
              <p className="text-sm text-slate-600">{application.job_title ?? "Unassigned role"}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-900">{application.match_score !== null ? `${application.match_score}%` : "Pending analysis"}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2">{formatDate(application.created_at)}</div>
              <Link href={`/recruiter/applications/${application.id}`} className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                Review
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
