"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { createJobSchema, normalizeSkills, type CreateJobValues } from "../validation/jobs";
import { supabase } from "./client";
import { supabaseServer } from "./server-client";
import { createAuthServerClient } from "./auth-server";

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

export type RecruiterJobSummary = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  status: "active" | "closed" | "draft";
  created_at: string;
  application_count: number;
};

export type CreateJobState = {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof CreateJobValues, string>>;
  values: CreateJobValues;
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

export async function getRecruiterJobs(): Promise<RecruiterJobSummary[]> {
  const authSupabase = await createAuthServerClient();
  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabaseServer
    .from("jobs")
    .select("id, title, department, location, employment_type, experience_level, status, created_at")
    .eq("recruiter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load recruiter jobs: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const jobIds = data.map((job) => job.id);
  const { data: applications, error: applicationError } = await supabaseServer
    .from("applications")
    .select("job_id")
    .in("job_id", jobIds);

  if (applicationError) {
    throw new Error(`Unable to count job applications: ${applicationError.message}`);
  }

  const counts = new Map<string, number>();
  for (const application of applications ?? []) {
    const current = counts.get(application.job_id) ?? 0;
    counts.set(application.job_id, current + 1);
  }

  return (data ?? []).map((job) => ({
    ...job,
    application_count: counts.get(job.id) ?? 0,
  })) as RecruiterJobSummary[];
}

export async function getActiveJobByIdOrThrow(jobId: string): Promise<PublicJob> {
  const job = await getActiveJobById(jobId);

  if (!job) {
    notFound();
  }

  return job;
}

export async function createRecruiterJob(prevState: CreateJobState, formData: FormData): Promise<CreateJobState> {
  const values: CreateJobValues = {
    title: formData.get("title")?.toString() ?? "",
    department: formData.get("department")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? "",
    employmentType: formData.get("employmentType")?.toString() ?? "full-time",
    experienceLevel: formData.get("experienceLevel")?.toString() ?? "mid",
    requiredSkills: formData.get("requiredSkills")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    requirements: formData.get("requirements")?.toString() ?? "",
    status: (formData.get("status")?.toString() as CreateJobValues["status"]) ?? "draft",
  };

  const parsed = createJobSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please correct the highlighted fields and try again.",
      errors: {
        title: fieldErrors.title?.[0],
        department: fieldErrors.department?.[0],
        location: fieldErrors.location?.[0],
        employmentType: fieldErrors.employmentType?.[0],
        experienceLevel: fieldErrors.experienceLevel?.[0],
        requiredSkills: fieldErrors.requiredSkills?.[0],
        description: fieldErrors.description?.[0],
        requirements: fieldErrors.requirements?.[0],
        status: fieldErrors.status?.[0],
      },
      values,
    };
  }

  const authSupabase = await createAuthServerClient();

const {
  data: { user },
  error: userError,
} = await authSupabase.auth.getUser();

if (userError || !user) {
  return {
    success: false,
    message: "Your session has expired. Please sign in again.",
    errors: {},
    values,
  };
}

  const { data, error } = await supabaseServer.from("jobs").insert({
    recruiter_id: user.id,
    title: parsed.data.title,
    department: parsed.data.department || null,
    location: parsed.data.location || null,
    employment_type: parsed.data.employmentType,
    experience_level: parsed.data.experienceLevel,
    required_skills: normalizeSkills(parsed.data.requiredSkills),
    description: parsed.data.description,
    requirements: parsed.data.requirements,
    status: parsed.data.status,
  }).select("id").single();

  if (error) {
    return {
      success: false,
      message: "We could not create the role right now. Please try again shortly.",
      errors: {},
      values,
    };
  }

  revalidatePath("/recruiter/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${data.id}`);
  redirect("/recruiter/jobs");
}
