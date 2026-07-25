"use client";

import { useMemo, useState } from "react";
import type { PublicJob } from "@/lib/supabase/jobs";
import { JobCard } from "./job-card";

export function JobSearch({ jobs }: { jobs: PublicJob[] }) {
  const [query, setQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return jobs;
    }

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.department,
        job.location,
        job.employment_type,
        job.experience_level,
        ...(job.required_skills ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [jobs, query]);

  return (
    <div className="space-y-8">
      <label className="block">
        <span className="sr-only">Search jobs</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, department, location or skill"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-indigo-300 focus:bg-white"
        />
      </label>

      {filteredJobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No matching roles found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try widening your search or check back soon for more openings.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              department={job.department}
              location={job.location}
              employmentType={job.employment_type}
              experienceLevel={job.experience_level}
              requiredSkills={job.required_skills}
            />
          ))}
        </div>
      )}
    </div>
  );
}
