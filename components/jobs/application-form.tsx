"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitApplication, type ApplicationFormState, type ApplicationFormValues } from "@/lib/supabase/applications";

export function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const initialValues: ApplicationFormValues = {
    name: "",
    email: "",
    phone: "",
    experienceYears: "",
    skills: "",
    profileSummary: "",
    githubUrl: "",
    portfolioUrl: "",
  };

  const [state, formAction, isPending] = useActionState<ApplicationFormState, FormData>(
    submitApplication,
    {
      success: false,
      message: "",
      errors: {},
      values: initialValues,
    },
  );

  const [formValues, setFormValues] = useState(initialValues);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof ApplicationFormValues,
  ) => {
    setFormValues((current) => ({ ...current, [field]: event.target.value }));
  };

  if (state.success) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Application received</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">Thanks for applying to {jobTitle}.</h2>
        <p className="mt-4 text-base leading-8 text-slate-700">{state.message}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse more roles
          </Link>
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Back to role
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="jobId" value={jobId} />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Apply for this role</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{jobTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Share a brief professional profile so our team can review your fit.
            </p>
          </div>
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Back to role
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Full name</span>
            <input
              name="name"
              value={formValues.name}
              onChange={(event) => handleChange(event, "name")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="Alex Morgan"
            />
            {state.errors.name ? <span className="mt-2 block text-sm text-red-600">{state.errors.name}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Email</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={(event) => handleChange(event, "email")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="alex@example.com"
            />
            {state.errors.email ? <span className="mt-2 block text-sm text-red-600">{state.errors.email}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Phone (optional)</span>
            <input
              name="phone"
              value={formValues.phone}
              onChange={(event) => handleChange(event, "phone")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="+1 555 123 4567"
            />
            {state.errors.phone ? <span className="mt-2 block text-sm text-red-600">{state.errors.phone}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Years of experience</span>
            <input
              inputMode="numeric"
              name="experienceYears"
              value={formValues.experienceYears}
              onChange={(event) => handleChange(event, "experienceYears")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="5"
            />
            {state.errors.experienceYears ? <span className="mt-2 block text-sm text-red-600">{state.errors.experienceYears}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            <span className="mb-2 block">Skills</span>
            <input
              name="skills"
              value={formValues.skills}
              onChange={(event) => handleChange(event, "skills")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="React, TypeScript, Product Design"
            />
            <span className="mt-2 block text-sm text-slate-500">Separate skills with commas.</span>
            {state.errors.skills ? <span className="mt-2 block text-sm text-red-600">{state.errors.skills}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            <span className="mb-2 block">Professional / profile summary</span>
            <textarea
              name="profileSummary"
              value={formValues.profileSummary}
              onChange={(event) => handleChange(event, "profileSummary")}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="Describe your experience, strengths, and what you are looking to build next."
            />
            {state.errors.profileSummary ? <span className="mt-2 block text-sm text-red-600">{state.errors.profileSummary}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">GitHub URL (optional)</span>
            <input
              type="url"
              name="githubUrl"
              value={formValues.githubUrl}
              onChange={(event) => handleChange(event, "githubUrl")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="https://github.com/yourname"
            />
            {state.errors.githubUrl ? <span className="mt-2 block text-sm text-red-600">{state.errors.githubUrl}</span> : null}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Portfolio URL (optional)</span>
            <input
              type="url"
              name="portfolioUrl"
              value={formValues.portfolioUrl}
              onChange={(event) => handleChange(event, "portfolioUrl")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
              placeholder="https://yourportfolio.com"
            />
            {state.errors.portfolioUrl ? <span className="mt-2 block text-sm text-red-600">{state.errors.portfolioUrl}</span> : null}
          </label>
        </div>

        {state.message && !state.success ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {isPending ? "Submitting..." : "Submit application"}
          </button>
          <span className="text-sm text-slate-500">We will review your profile and keep your application under review.</span>
        </div>
      </div>
    </form>
  );
}

