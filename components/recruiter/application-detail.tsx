import Link from "next/link";
import type { RecruiterApplicationDetail } from "@/lib/recruiter/data";


function AlignmentBadge({
  status,
}: {
  status:
    | "verified_match"
    | "supported_match"
    | "claimed_match"
    | "missing"
    | "unmapped_requirement";
}) {
  const config = {
    verified_match: {
      label: "Verified",
      className: "bg-emerald-100 text-emerald-800",
    },
    supported_match: {
      label: "Supported",
      className: "bg-blue-100 text-blue-800",
    },
    claimed_match: {
      label: "Claimed only",
      className: "bg-amber-100 text-amber-800",
    },
    missing: {
      label: "Missing",
      className: "bg-rose-100 text-rose-800",
    },
    unmapped_requirement: {
      label: "Unmapped",
      className: "bg-slate-100 text-slate-700",
    },
  }[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

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

function EvidenceStatusBadge({
  status,
}: {
  status: "uploaded" | "processing" | "processed" | "failed";
}) {
  const tone = {
    uploaded: "bg-slate-100 text-slate-700",
    processing: "bg-amber-50 text-amber-700",
    processed: "bg-emerald-50 text-emerald-700",
    failed: "bg-rose-50 text-rose-700",
  }[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${tone}`}
    >
      {status}
    </span>
  );
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

      <Section title="Evidence-backed job alignment">
  {!application.evidenceMatch ? (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
      <p className="font-medium text-slate-900">
        No evidence-backed alignment available
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Skill evidence has not been evaluated against this role yet.
      </p>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Requirements
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {application.evidenceMatch.total_requirements}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Verified
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">
            {application.evidenceMatch.verified_matches}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Supported
          </p>
          <p className="mt-2 text-2xl font-semibold text-blue-950">
            {application.evidenceMatch.supported_matches}
          </p>
        </div>

        <div className="rounded-2xl bg-rose-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Missing
          </p>
          <p className="mt-2 text-2xl font-semibold text-rose-950">
            {application.evidenceMatch.missing_requirements}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {application.evidenceMatch.alignments.map((alignment) => (
          <div
            key={`${alignment.required_skill}-${alignment.canonical_skill ?? "unmapped"}`}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">
                  {alignment.display_name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Required skill: {alignment.required_skill}
                </p>
              </div>

              <AlignmentBadge status={alignment.alignment_status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {alignment.claimed_in_application ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  Application claim
                </span>
              ) : null}

              {alignment.observed_in_resume ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  Resume evidence
                </span>
              ) : null}

              {alignment.observed_in_github ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  GitHub evidence
                </span>
              ) : null}
            </div>

            {alignment.evidence_strength ? (
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium text-slate-900">
                  Evidence strength:
                </span>{" "}
                {alignment.evidence_strength}
                {" · "}
                {alignment.evidence_count} evidence observation
                {alignment.evidence_count === 1 ? "" : "s"}
                {" · "}
                {alignment.source_count} source
                {alignment.source_count === 1 ? "" : "s"}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No supporting candidate evidence was found for this requirement.
              </p>
            )}
            {alignment.evidence_items.length > 0 ? (
  <details className="mt-4 border-t border-slate-100 pt-4">
    <summary className="cursor-pointer text-sm font-semibold text-indigo-600">
      View {alignment.evidence_items.length} evidence observation
      {alignment.evidence_items.length === 1 ? "" : "s"}
    </summary>

    <div className="mt-4 space-y-3">
      {alignment.evidence_items.map((item, index) => (
        <div
          key={`${item.evidence_type}-${item.source_reference ?? "evidence"}-${index}`}
          className="rounded-xl bg-slate-50 p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
              {item.evidence_type.replaceAll("_", " ")}
            </span>

            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
              {item.evidence_quality}
            </span>
          </div>

          {item.source_reference ? (
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {item.source_reference}
            </p>
          ) : null}

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  </details>
) : null}
          </div>
        ))}
      </div>

      <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        Alignment is derived from normalized candidate claims and available
        resume and GitHub evidence. Missing evidence does not prove lack of
        capability.
      </p>
    </div>
  )}
</Section>

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

      <Section title="Resume evidence">
        {!application.resumeEvidence ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
            <p className="font-medium text-slate-900">No resume evidence available</p>
            <p className="mt-1 text-sm text-slate-600">
              This application does not have processed resume intelligence yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {application.resumeEvidence.filename ?? "Candidate resume"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Evidence extracted from the candidate&apos;s uploaded resume.
                </p>
              </div>

              <EvidenceStatusBadge status={application.resumeEvidence.sourceStatus} />
            </div>

            {application.resumeEvidence.extractionStatus === "processing" ||
            application.resumeEvidence.extractionStatus === "pending" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                Resume intelligence is still being processed.
              </div>
            ) : null}

            {application.resumeEvidence.extractionStatus === "failed" ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="font-semibold text-rose-800">Resume intelligence unavailable</p>
                <p className="mt-1 text-sm text-rose-700">
                  The resume was received, but structured evidence extraction could not be completed.
                </p>
              </div>
            ) : null}

            {application.resumeEvidence.professionalSummary ? (
              <div>
                <h4 className="font-semibold text-slate-950">Resume summary</h4>
                <p className="mt-2 leading-7">
                  {application.resumeEvidence.professionalSummary}
                </p>
              </div>
            ) : null}

      {application.resumeEvidence.skills.length > 0 ? (
        <div>
          <h4 className="font-semibold text-slate-950">Skills with evidence</h4>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {application.resumeEvidence.skills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">{skill.name}</p>

                {skill.evidence.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {skill.evidence.map((evidence, evidenceIndex) => (
                      <li key={`${skill.name}-evidence-${evidenceIndex}`}>
                        {evidence}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Mentioned in the resume without additional supporting context.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {application.resumeEvidence.experience.length > 0 ? (
        <div>
          <h4 className="font-semibold text-slate-950">Experience evidence</h4>

          <div className="mt-3 space-y-3">
            {application.resumeEvidence.experience.map((experience, index) => (
              <div
                key={`${experience.company}-${experience.role}-${index}`}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {experience.role}
                    </p>
                    <p className="text-sm text-slate-600">{experience.company}</p>
                  </div>

                  {(experience.startDate || experience.endDate) ? (
                    <p className="text-xs text-slate-500">
                      {experience.startDate ?? "Unknown"} – {experience.endDate ?? "Present"}
                    </p>
                  ) : null}
                </div>

                <p className="mt-3 leading-6">{experience.description}</p>

                {experience.skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {experience.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {application.resumeEvidence.projects.length > 0 ? (
        <div>
          <h4 className="font-semibold text-slate-950">Project evidence</h4>

          <div className="mt-3 space-y-3">
            {application.resumeEvidence.projects.map((project, index) => (
              <div
                key={`${project.name}-${index}`}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">{project.name}</p>
                <p className="mt-2 leading-6">{project.description}</p>

                {project.technologies.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                ) : null}

                {project.evidence.length > 0 ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {project.evidence.map((evidence, evidenceIndex) => (
                      <li key={`${project.name}-evidence-${evidenceIndex}`}>
                        {evidence}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {application.resumeEvidence.education.length > 0 ? (
        <div>
          <h4 className="font-semibold text-slate-950">Education</h4>

          <div className="mt-3 space-y-3">
            {application.resumeEvidence.education.map((education, index) => (
              <div
                key={`${education.institution}-${education.degree}-${index}`}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">{education.degree}</p>

                <p className="mt-1">
                  {education.field ? `${education.field} · ` : ""}
                  {education.institution}
                </p>

                {(education.startDate || education.endDate) ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {education.startDate ?? "Unknown"} – {education.endDate ?? "Present"}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {application.resumeEvidence.certifications.length > 0 ? (
        <div>
          <h4 className="font-semibold text-slate-950">Certifications</h4>

          <div className="mt-3 flex flex-wrap gap-2">
            {application.resumeEvidence.certifications.map((certification, index) => (
              <span
                key={`${certification.name}-${index}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {certification.name}
                {certification.issuer ? ` · ${certification.issuer}` : ""}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        Resume evidence reflects information found in the candidate&apos;s uploaded document.
        Absence of evidence does not necessarily mean absence of a skill or experience.
      </p>
    </div>
  )}
</Section>

      <div className="flex justify-start">
        <Link href="/recruiter" className="text-sm font-semibold text-indigo-600 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
