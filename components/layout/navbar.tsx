import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-sm">
            HL
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            HireLens
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-slate-900">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-slate-900">
            How it works
          </a>
          <a href="#cta" className="transition hover:text-slate-900">
            Contact
          </a>
        </nav>

        <a
          href="#cta"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Book a demo
        </a>
      </div>
    </header>
  );
}
