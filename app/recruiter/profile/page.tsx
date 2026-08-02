import Link from "next/link";

import { getRecruiterProfile } from "@/lib/supabase/recruiter";
import { RecruiterProfileForm } from "@/components/recruiter/profile-form";
import type { RecruiterProfileState } from "@/lib/supabase/recruiter-state";
import { initialRecruiterProfileState } from "@/lib/supabase/recruiter-state";

export default async function RecruiterProfilePage() {
  const profile = await getRecruiterProfile();

  const initialValues: RecruiterProfileState["values"] = profile
    ? {
        displayName: profile.display_name ?? "",
        headline: profile.headline ?? "",
        about: profile.about ?? "",

        hiringType: profile.hiring_type,

        companyName: profile.company_name ?? "",
        companyWebsite: profile.company_website ?? "",
        companyLinkedin: profile.company_linkedin ?? "",

        recruiterLinkedin: profile.recruiter_linkedin ?? "",
        professionalEmail: profile.professional_email ?? "",

        location: profile.location ?? "",

        showEmail: profile.show_email,
        showLinkedin: profile.show_linkedin,
        allowDirectContact: profile.allow_direct_contact,
      }
    : initialRecruiterProfileState.values;

  return (
    <main className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Recruiter Profile
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {profile ? "Edit Profile" : "Create Profile"}
          </h1>
        </div>

        <Link
          href="/recruiter"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Back to Dashboard
        </Link>
      </header>

      <RecruiterProfileForm
        mode={profile ? "edit" : "create"}
        initialValues={initialValues}
      />
    </main>
  );
}