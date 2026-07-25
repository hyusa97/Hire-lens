import Link from "next/link";

const items = [
  { href: "/recruiter", label: "Overview", icon: "◉" },
  { href: "/recruiter/jobs", label: "Jobs", icon: "◌" },
  { href: "/recruiter/applications", label: "Applications", icon: "◍" },
];

export function RecruiterSidebar() {
  return (
    <aside className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:w-72">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Recruiter</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">HireLens HQ</h2>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
