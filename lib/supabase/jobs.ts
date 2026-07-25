import { notFound } from "next/navigation";
import { supabase } from "./client";

export type PublicJob = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  required_skills: string[] | null;
  experience_level: string | null;
  status: "active" | "closed" | "draft";
  created_at: string;
  updated_at: string;
};

export async function getActiveJobs(): Promise<PublicJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, department, location, employment_type, description, requirements, required_skills, experience_level, status, created_at, updated_at",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load jobs: ${error.message}`);
  }

  return (data ?? []) as PublicJob[];
}

export async function getActiveJobById(jobId: string): Promise<PublicJob | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, department, location, employment_type, description, requirements, required_skills, experience_level, status, created_at, updated_at",
    )
    .eq("id", jobId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the requested job: ${error.message}`);
  }

  return (data as PublicJob | null) ?? null;
}

export async function getActiveJobByIdOrThrow(jobId: string): Promise<PublicJob> {
  const job = await getActiveJobById(jobId);

  if (!job) {
    notFound();
  }

  return job;
}
