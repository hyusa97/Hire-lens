const features = [
  {
    title: "AI Candidate Analysis",
    description:
      "Surface role-fit insights, communication signals, and experience alignment in one place.",
    metric: "84% match confidence",
  },
  {
    title: "Skill Gap Detection",
    description:
      "Highlight the gaps that matter most so teams can prioritize interviews and development paths.",
    metric: "2 priority gaps",
  },
  {
    title: "Recruitment Analytics",
    description:
      "Track conversion, response quality, and hiring momentum with a concise leadership view.",
    metric: "Live pipeline view",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-slate-200 bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Why HireLens
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Built for teams that need clarity at every step.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            From role creation to final decision, HireLens brings structure, insight, and momentum to recruiting.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-semibold text-indigo-700">
                {feature.title.charAt(0)}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              <p className="mt-5 text-sm font-semibold text-indigo-700">{feature.metric}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
