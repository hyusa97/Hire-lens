import type { ReactNode } from "react";
import { RecruiterSidebar } from "@/components/recruiter/sidebar-nav";

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:px-8">
        <RecruiterSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
