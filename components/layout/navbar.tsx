import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-sm">
            HL
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            HireLens
          </span>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
          <Link href="/jobs" className="transition hover:text-slate-900">
            Find Jobs
          </Link>
          <Link href="/#how-it-works" className="transition hover:text-slate-900">
            How It Works
          </Link>
          <Link href="/recruiter" className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
            Recruiter Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}
