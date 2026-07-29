"use client";

import { useActionState } from "react";
import {
  createRecruiterJob,
  updateRecruiterJob,
  type CreateJobState,
} from "@/lib/supabase/jobs";

const initialState: CreateJobState = {
  success: false,
  message: "",
  errors: {},
  values: {
    title: "",
    department: "",
    location: "",
    employmentType: "full-time",
    experienceLevel: "mid",
    requiredSkills: "",
    description: "",
    requirements: "",
    status: "draft",
  },
};
type RecruiterJobFormProps = {
  mode?: "create" | "edit";
  jobId?: string;
  initialValues?: CreateJobState["values"];
};

export function RecruiterJobForm({
  mode = "create",
  jobId,
  initialValues,
}: RecruiterJobFormProps) {
  const formState: CreateJobState = {
  ...initialState,
  values: initialValues ?? initialState.values,
};

const action =
  mode === "edit"
    ? updateRecruiterJob.bind(null, jobId!)
    : createRecruiterJob;

const [state, formAction, isPending] =
  useActionState(action, formState);

  return (
    <form action={formAction} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Create role</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Publish a new opening</h2>
        <p className="text-sm text-slate-600">
          Add a fresh opportunity to HireLens. Active roles will appear on the public jobs page automatically.
        </p>
      </div>

      {state.message ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-slate-800">Title</label>
          <input id="title" name="title" defaultValue={state.values.title} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400" placeholder="Senior Product Designer" required />
          {state.errors.title ? <p className="text-sm text-rose-600">{state.errors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="department" className="text-sm font-semibold text-slate-800">Department</label>
          <input id="department" name="department" defaultValue={state.values.department} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400" placeholder="Design" />
          {state.errors.department ? <p className="text-sm text-rose-600">{state.errors.department}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-semibold text-slate-800">Location</label>
          <input id="location" name="location" defaultValue={state.values.location} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400" placeholder="Remote / US / Europe" />
          {state.errors.location ? <p className="text-sm text-rose-600">{state.errors.location}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="employmentType" className="text-sm font-semibold text-slate-800">Employment type</label>
          <select id="employmentType" name="employmentType" defaultValue={state.values.employmentType} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400">
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          {state.errors.employmentType ? <p className="text-sm text-rose-600">{state.errors.employmentType}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="experienceLevel" className="text-sm font-semibold text-slate-800">Experience level</label>
          <select id="experienceLevel" name="experienceLevel" defaultValue={state.values.experienceLevel} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400">
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
          {state.errors.experienceLevel ? <p className="text-sm text-rose-600">{state.errors.experienceLevel}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-semibold text-slate-800">Status</label>
          <select id="status" name="status" defaultValue={state.values.status} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          {state.errors.status ? <p className="text-sm text-rose-600">{state.errors.status}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="requiredSkills" className="text-sm font-semibold text-slate-800">Required skills</label>
        <input id="requiredSkills" name="requiredSkills" defaultValue={state.values.requiredSkills} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400" placeholder="React, TypeScript, Product Strategy" />
        <p className="text-sm text-slate-500">Separate skills with commas to keep the list clean and searchable.</p>
        {state.errors.requiredSkills ? <p className="text-sm text-rose-600">{state.errors.requiredSkills}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-semibold text-slate-800">Description</label>
        <textarea id="description" name="description" defaultValue={state.values.description} rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400" placeholder="Describe the role, the team, and the impact" required />
        {state.errors.description ? <p className="text-sm text-rose-600">{state.errors.description}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="requirements" className="text-sm font-semibold text-slate-800">Requirements</label>
        <textarea id="requirements" name="requirements" defaultValue={state.values.requirements} rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400" placeholder="List must-have qualifications, responsibilities, and expectations" required />
        {state.errors.requirements ? <p className="text-sm text-rose-600">{state.errors.requirements}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Creating role..." : "Create role"}
        </button>
        <a href="/recruiter/jobs" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          Cancel
        </a>
      </div>
    </form>
  );
}

