"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/auth/actions";

const items = [
  {
    href: "/recruiter",
    label: "Overview",
  },
  {
    href: "/recruiter/jobs",
    label: "Jobs",
  },
  {
    href: "/recruiter/profile",
    label: "Profile",
  },
  {
    href: "/recruiter/applications",
    label: "Applications",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/recruiter") {
    return pathname === "/recruiter";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RecruiterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:w-72 lg:shrink-0">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
          Recruiter
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          HireLens HQ
        </h2>
      </div>

      <nav aria-label="Recruiter navigation" className="space-y-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <Link
          href="/"
          className="flex items-center rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          View Public Site
        </Link>

        <form action={logout} className="mt-2">
          <button
            type="submit"
            className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}