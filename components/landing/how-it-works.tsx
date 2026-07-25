const steps = [
  {
    title: "Job Created",
    copy: "Define the role, requirements, and ideal profile in minutes.",
  },
  {
    title: "Candidate Applies",
    copy: "Applicants submit experience, skills, and motivation in one flow.",
  },
  {
    title: "AI Analysis",
    copy: "HireLens generates fit signals, skill gaps, and recommendation notes.",
  },
  {
    title: "Recruiter Decision",
    copy: "Move quickly with a clear, evidence-based shortlist and next steps.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          A simple path from opening to decision.
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {index + 1}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
