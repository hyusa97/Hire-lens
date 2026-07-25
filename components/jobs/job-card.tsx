import Link from "next/link";

export type JobCardProps = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  requiredSkills: string[] | null;
};

export function JobCard({
  id,
  title,
  department,
  location,
  employmentType,
  experienceLevel,
  requiredSkills,
}: JobCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
          {department ?? "General"}
        </span>
        <span>{location ?? "Remote"}</span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
        <span className="rounded-full border border-slate-200 px-3 py-1">
          {employmentType ?? "Full time"}
        </span>
        <span className="rounded-full border border-slate-200 px-3 py-1">
          {experienceLevel ?? "Mid level"}
        </span>
      </div>

      {requiredSkills && requiredSkills.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {requiredSkills.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        <Link
          href={`/jobs/${id}`}
          className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          View Position
        </Link>
      </div>
    </article>
  );
}
