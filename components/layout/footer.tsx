import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          (c) 2026 HireLens. Built for modern recruiting teams.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/jobs" className="transition hover:text-slate-900">
            Find Jobs
          </Link>
          <Link href="/#how-it-works" className="transition hover:text-slate-900">
            Workflow
          </Link>
          <Link href="/recruiter" className="transition hover:text-slate-900">
            Recruiter Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
