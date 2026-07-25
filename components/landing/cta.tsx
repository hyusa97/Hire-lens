export function Cta() {
  return (
    <section id="cta" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-10 shadow-sm sm:p-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
              Ready to see it in action?
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Bring structure to hiring and momentum to your team.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Discover how HireLens helps recruiters evaluate candidates with confidence and clarity.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:hello@hirelens.ai"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Contact Sales
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            >
              View product tour
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
