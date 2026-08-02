import type { RecruiterProfileState } from "@/lib/supabase/recruiter-state";

type Props = {
  state: RecruiterProfileState;
};

export function ProfileBasicSection({ state }: Props) {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Recruiter Information
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Tell candidates who is hiring them.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-slate-700"
          >
            Display Name
          </label>

          <input
            id="displayName"
            name="displayName"
            defaultValue={state.values.displayName}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.displayName && (
            <p className="text-sm text-red-600">
              {state.errors.displayName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="headline"
            className="text-sm font-medium text-slate-700"
          >
            Headline
          </label>

          <input
            id="headline"
            name="headline"
            defaultValue={state.values.headline}
            placeholder="Senior Technical Recruiter"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.headline && (
            <p className="text-sm text-red-600">
              {state.errors.headline}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="about"
          className="text-sm font-medium text-slate-700"
        >
          About
        </label>

        <textarea
          id="about"
          name="about"
          rows={5}
          defaultValue={state.values.about}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />

        {state.errors.about && (
          <p className="text-sm text-red-600">
            {state.errors.about}
          </p>
        )}
      </div>
    </section>
  );
}