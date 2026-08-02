"use client";

import { useActionState } from "react";

import {
  createRecruiterProfile,
  updateRecruiterProfile,
} from "@/lib/supabase/recruiter";

import {
  initialRecruiterProfileState,
  type RecruiterProfileState,
} from "@/lib/supabase/recruiter-state";

import { ProfileBasicSection } from "./profile-basic";
import { ProfileCompanySection } from "./profile-company";
import { ProfilePrivacySection } from "./profile-privacy";

type RecruiterProfileFormProps = {
  mode?: "create" | "edit";
  initialValues?: RecruiterProfileState["values"];
  hasExistingProfile?: boolean;
};

export function RecruiterProfileForm({
  mode = "create",
  initialValues,
}: RecruiterProfileFormProps) {
  const formState: RecruiterProfileState = {
    ...initialRecruiterProfileState,
    values: initialValues ?? initialRecruiterProfileState.values,
  };

  const action =
    mode === "edit"
      ? updateRecruiterProfile
      : createRecruiterProfile;

  const [state, formAction, isPending] =
    useActionState(action, formState);

  return (
    <form
      action={formAction}
      className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
          Recruiter Profile
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {mode === "create"
            ? "Create your recruiter profile"
            : "Edit recruiter profile"}
        </h2>

        <p className="mt-3 text-sm text-slate-600">
          This information helps candidates understand who is hiring and
          builds trust before they apply.
        </p>
      </div>

      {state.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <ProfileBasicSection state={state} />

      <ProfileCompanySection state={state} />

      <ProfilePrivacySection state={state} />
            <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Profile"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}