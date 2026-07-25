import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { RecruiterSidebar } from "@/components/recruiter/sidebar-nav";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export default async function RecruiterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:px-8">
        <RecruiterSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}