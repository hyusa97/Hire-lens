"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { analyzeCandidateWithGemini } from "../ai/analyze-candidate";
import { supabase } from "./client";
import { getActiveJobById } from "./jobs";
import { supabaseServer } from "./server-client";
import type { Database } from "./types";

export type ApplicationFormValues = {
  name: string;
  email: string;
  phone: string;
  experienceYears: string;
  skills: string;
  profileSummary: string;
  githubUrl: string;
  portfolioUrl: string;
};

export type ApplicationFormState = {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof ApplicationFormValues, string>>;
  values: ApplicationFormValues;
};

const optionalUrlSchema = z.union([
  z.literal(""),
  z.string().trim().url("Please enter a valid URL."),
]);

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(30, "Please enter a shorter phone number."),
  experienceYears: z.coerce
    .number({ message: "Please enter a valid number of years." })
    .int({ message: "Please enter a whole number of years." })
    .nonnegative({ message: "Years of experience cannot be negative." })
    .max(60, { message: "Please enter a realistic number of years." }),
  skills: z
    .array(z.string().trim().min(1))
    .min(1, "Please enter at least one skill."),
  profileSummary: z
    .string()
    .trim()
    .min(20, "Please provide a meaningful professional summary."),
  githubUrl: optionalUrlSchema.transform((value) => (value === "" ? null : value)),
  portfolioUrl: optionalUrlSchema.transform((value) => (value === "" ? null : value)),
});

function normalizeSkills(rawSkills: string) {
  return rawSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function getInitialState(values: ApplicationFormValues): ApplicationFormState {
  return {
    success: false,
    message: "",
    errors: {},
    values,
  };
}

function isDuplicateApplicationError(error: { code?: string | null }) {
  return error.code === "23505";
}

export async function submitApplication(
  prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const values: ApplicationFormValues = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    experienceYears: formData.get("experienceYears")?.toString() ?? "",
    skills: formData.get("skills")?.toString() ?? "",
    profileSummary: formData.get("profileSummary")?.toString() ?? "",
    githubUrl: formData.get("githubUrl")?.toString() ?? "",
    portfolioUrl: formData.get("portfolioUrl")?.toString() ?? "",
  };

  const parsed = applicationSchema.safeParse({
    name: values.name,
    email: values.email.toLowerCase().trim(),
    phone: values.phone.trim(),
    experienceYears: values.experienceYears,
    skills: normalizeSkills(values.skills),
    profileSummary: values.profileSummary,
    githubUrl: values.githubUrl.trim(),
    portfolioUrl: values.portfolioUrl.trim(),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please correct the highlighted fields and try again.",
      errors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        experienceYears: fieldErrors.experienceYears?.[0],
        skills: fieldErrors.skills?.[0],
        profileSummary: fieldErrors.profileSummary?.[0],
        githubUrl: fieldErrors.githubUrl?.[0],
        portfolioUrl: fieldErrors.portfolioUrl?.[0],
      },
      values,
    };
  }

  const jobId = formData.get("jobId")?.toString();
  if (!jobId) {
    return {
      ...getInitialState(values),
      success: false,
      message: "The role selection could not be confirmed.",
    };
  }

  const activeJob = await getActiveJobById(jobId);
  if (!activeJob) {
    return {
      ...getInitialState(values),
      success: false,
      message: "This role is no longer available to apply for.",
    };
  }

  const candidateId = randomUUID();
  type CandidateInsertPayload = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    skills: string[];
    experience_years: number;
    profile_summary: string;
    github_url: string | null;
    portfolio_url: string | null;
  };

  const candidatePayload: CandidateInsertPayload = {
    id: candidateId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    skills: parsed.data.skills,
    experience_years: parsed.data.experienceYears,
    profile_summary: parsed.data.profileSummary,
    github_url: parsed.data.githubUrl,
    portfolio_url: parsed.data.portfolioUrl,
  };

  try {
    const { error: candidateError } = await supabase
      .from("candidates")
      .insert(candidatePayload as Database["public"]["Tables"]["candidates"]["Insert"] & { id: string });

    if (candidateError) {
      console.error("[submitApplication] candidate insert failed", {
        message: candidateError?.message,
        code: candidateError?.code,
        details: candidateError?.details,
        hint: candidateError?.hint,
      });

      return {
        ...getInitialState(values),
        success: false,
        message: "We could not save your profile right now. Please try again shortly.",
      };
    }

    const applicationPayload: Database["public"]["Tables"]["applications"]["Insert"] = {
      job_id: jobId,
      candidate_id: candidateId,
      status: "pending",
      match_score: null,
      matched_skills: [],
      missing_skills: [],
      strengths: [],
      concerns: [],
      ai_summary: null,
      recommendation: null,
    };

    const { error: applicationError } = await supabase.from("applications").insert(applicationPayload);

    if (applicationError) {
      console.error("[submitApplication] application insert failed", {
        message: applicationError?.message,
        code: applicationError?.code,
        details: applicationError?.details,
        hint: applicationError?.hint,
      });

      await supabase.from("candidates").delete().eq("id", candidateId);

      if (isDuplicateApplicationError(applicationError)) {
        return {
          ...getInitialState(values),
          success: false,
          message: "You have already applied for this role. We will keep your application under review.",
        };
      }

      return {
        ...getInitialState(values),
        success: false,
        message: "We could not submit your application right now. Please try again shortly.",
      };
    }

    void (async () => {
      try {
        const { data: applicationRecord, error: applicationLookupError } = await supabaseServer
          .from("applications")
          .select("id, job_id, candidate_id, status")
          .eq("candidate_id", candidateId)
          .eq("job_id", jobId)
          .maybeSingle();

        const { data: candidateRecord, error: candidateLookupError } = await supabaseServer
          .from("candidates")
          .select("skills, experience_years, profile_summary")
          .eq("id", candidateId)
          .maybeSingle();

        const { data: jobRecord, error: jobLookupError } = await supabaseServer
          .from("jobs")
          .select("title, department, description, requirements, required_skills, experience_level")
          .eq("id", jobId)
          .maybeSingle();

        if (applicationLookupError || candidateLookupError || jobLookupError || !applicationRecord || !candidateRecord || !jobRecord) {
          console.error("[AI Evaluation] records load failed", {
            applicationLookupError: applicationLookupError?.message,
            candidateLookupError: candidateLookupError?.message,
            jobLookupError: jobLookupError?.message,
          });
          return;
        }

        console.info("[AI Evaluation] records loaded", { applicationId: applicationRecord.id });

        const evaluation = await analyzeCandidateWithGemini(
          {
            title: jobRecord.title,
            department: jobRecord.department,
            description: jobRecord.description,
            requirements: jobRecord.requirements,
            requiredSkills: jobRecord.required_skills,
            experienceLevel: jobRecord.experience_level,
          },
          {
            skills: candidateRecord.skills ?? [],
            experienceYears: candidateRecord.experience_years ?? 0,
            profileSummary: candidateRecord.profile_summary ?? "",
          },
        );

        console.info("[AI Evaluation] schema validated", { applicationId: applicationRecord.id });

        const { error: updateError } = await supabaseServer.from("applications").update({
          match_score: evaluation.matchScore,
          matched_skills: evaluation.matchedSkills,
          missing_skills: evaluation.missingSkills,
          strengths: evaluation.strengths,
          concerns: evaluation.concerns,
          ai_summary: evaluation.summary,
          recommendation: evaluation.recommendation,
        }).eq("id", applicationRecord.id);

        if (updateError) {
          console.error("[AI Evaluation] database update failed", {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint,
          });
          return;
        }

        console.info("[AI Evaluation] database update completed", { applicationId: applicationRecord.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown AI evaluation error";
        const name = error instanceof Error ? error.name : "UnknownError";
        console.error("[AI Evaluation] unexpected failure", { name, message });
      }
    })();

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);

    return {
      success: true,
      message: "Your application has been received. We will review it shortly.",
      errors: {},
      values: {
        name: "",
        email: "",
        phone: "",
        experienceYears: "",
        skills: "",
        profileSummary: "",
        githubUrl: "",
        portfolioUrl: "",
      },
    };
  } catch {
    return {
      ...getInitialState(values),
      success: false,
      message: "We hit a network issue while submitting your application. Please try again shortly.",
    };
  }
}
