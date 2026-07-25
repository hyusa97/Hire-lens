export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          © 2026 HireLens. Built for modern recruiting teams.
        </p>
        <div className="flex items-center gap-5">
          <a href="#features" className="transition hover:text-slate-900">
            Platform
          </a>
          <a href="#how-it-works" className="transition hover:text-slate-900">
            Workflow
          </a>
          <a href="#cta" className="transition hover:text-slate-900">
            Get started
          </a>
        </div>
      </div>
    </footer>
  );
}
