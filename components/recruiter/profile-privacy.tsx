import type { RecruiterProfileState } from "@/lib/supabase/recruiter-state";

type Props = {
  state: RecruiterProfileState;
};

export function ProfilePrivacySection({ state }: Props) {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Privacy & Contact
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Decide what candidates can see on your public profile.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="showEmail"
            defaultChecked={state.values.showEmail}
            className="h-4 w-4"
          />

          <span className="text-sm text-slate-700">
            Show professional email to candidates
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="showLinkedin"
            defaultChecked={state.values.showLinkedin}
            className="h-4 w-4"
          />

          <span className="text-sm text-slate-700">
            Show LinkedIn profile
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="allowDirectContact"
            defaultChecked={state.values.allowDirectContact}
            className="h-4 w-4"
          />

          <span className="text-sm text-slate-700">
            Allow candidates to contact me directly
          </span>
        </label>
      </div>
    </section>
  );
}