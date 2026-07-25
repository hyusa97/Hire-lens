import Link from "next/link";

const highlights = [
  { label: "Hiring velocity", value: "3.2x faster" },
  { label: "Fit confidence", value: "94%" },
  { label: "Time saved", value: "12 hrs/week" },
];

export function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 lg:px-8 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            <span className="mr-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />
            AI-powered recruiting intelligence
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Hire smarter. Screen faster.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            HireLens turns open roles, candidate applications, and hiring signals into a clear
            decision-ready workflow for recruiters and applicants alike.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Explore Jobs
            </Link>
            <Link
              href="/recruiter"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Recruiter Dashboard
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="font-semibold text-slate-900">{item.value}</p>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.4)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Candidate fit snapshot</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Senior Product Designer
                </h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                92% fit
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Match score</span>
                  <span className="font-semibold text-slate-900">92/100</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[92%] rounded-full bg-indigo-600" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Skill gaps</span>
                  <span className="font-semibold text-slate-900">2 key gaps</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Design systems leadership</li>
                  <li>Advanced analytics fluency</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Recommended action</span>
                  <span className="font-semibold text-slate-900">Interview</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Strong alignment on product thinking and stakeholder management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
