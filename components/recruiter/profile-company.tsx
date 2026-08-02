import type { RecruiterProfileState } from "@/lib/supabase/recruiter-state";

type Props = {
  state: RecruiterProfileState;
};

export function ProfileCompanySection({ state }: Props) {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Company Information
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Help candidates identify the organization behind the role.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="hiringType" className="text-sm font-medium text-slate-700">
            Hiring Type
          </label>

          <select
            id="hiringType"
            name="hiringType"
            defaultValue={state.values.hiringType}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="company">Company</option>
            <option value="startup">Startup</option>
            <option value="agency">Agency</option>
            <option value="freelancer">Freelancer</option>
            <option value="government">Government</option>
            <option value="university">University</option>
            <option value="consultancy">Consultancy</option>
            <option value="ngo">NGO</option>
          </select>

          {state.errors.hiringType && (
            <p className="text-sm text-red-600">
              {state.errors.hiringType}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="companyName" className="text-sm font-medium text-slate-700">
            Company Name
          </label>

          <input
            id="companyName"
            name="companyName"
            defaultValue={state.values.companyName}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.companyName && (
            <p className="text-sm text-red-600">
              {state.errors.companyName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="companyWebsite" className="text-sm font-medium text-slate-700">
            Company Website
          </label>

          <input
            id="companyWebsite"
            name="companyWebsite"
            defaultValue={state.values.companyWebsite}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.companyWebsite && (
            <p className="text-sm text-red-600">
              {state.errors.companyWebsite}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="companyLinkedin" className="text-sm font-medium text-slate-700">
            Company LinkedIn
          </label>

          <input
            id="companyLinkedin"
            name="companyLinkedin"
            defaultValue={state.values.companyLinkedin}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.companyLinkedin && (
            <p className="text-sm text-red-600">
              {state.errors.companyLinkedin}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="professionalEmail" className="text-sm font-medium text-slate-700">
            Professional Email
          </label>

          <input
            id="professionalEmail"
            name="professionalEmail"
            defaultValue={state.values.professionalEmail}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.professionalEmail && (
            <p className="text-sm text-red-600">
              {state.errors.professionalEmail}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-slate-700">
            Location
          </label>

          <input
            id="location"
            name="location"
            defaultValue={state.values.location}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.location && (
            <p className="text-sm text-red-600">
              {state.errors.location}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="recruiterLinkedin" className="text-sm font-medium text-slate-700">
            Recruiter LinkedIn
          </label>

          <input
            id="recruiterLinkedin"
            name="recruiterLinkedin"
            defaultValue={state.values.recruiterLinkedin}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          {state.errors.recruiterLinkedin && (
            <p className="text-sm text-red-600">
              {state.errors.recruiterLinkedin}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}