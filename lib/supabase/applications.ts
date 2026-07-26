"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { analyzeCandidateWithGemini } from "../ai/analyze-candidate";
import { analyzeResumeFromPdfWithGemini } from "../ai/analyze-resume";
import {
  parseApplicationValues,
  validateResumeFile,
} from "../validation/applications";
import type { ApplicationFormValues } from "../validation/applications";


import { supabase } from "./client";
import { getActiveJobById } from "./jobs";
import { supabaseServer } from "./server-client";
import type { Database } from "./types";
import type { ApplicationFormState } from "../validation/application-form-state";

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

function sanitizeResumeExtractionError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Resume extraction failed due to an unexpected error.";
  }

  const message = error.message.trim();
  if (!message) {
    return "Resume extraction failed due to an unexpected error.";
  }

  if (message.length > 300) {
    return `${message.slice(0, 297)}...`;
  }

  return message;
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

  const parsed = parseApplicationValues(values);
  const resumeValidation = validateResumeFile(formData.get("resume"));

  // 1. Validate candidate/application form fields
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

  // 2. Validate resume before trying to use resumeValidation.file
  if (!resumeValidation.success) {
    return {
      ...getInitialState(values),
      success: false,
      message: resumeValidation.error,
    };
  }

  // From this point onward TypeScript knows resumeValidation.file exists.
  const resumeFile = resumeValidation.file;

  // 3. Validate job
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

  // 4. Generate candidate ID before database/storage operations
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
    // 5. Insert candidate
    const { error: candidateError } = await supabase
      .from("candidates")
      .insert(
        candidatePayload as Database["public"]["Tables"]["candidates"]["Insert"] & {
          id: string;
        },
      );

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
        message:
          "We could not save your profile right now. Please try again shortly.",
      };
    }

    // 6. Upload validated resume AFTER candidate exists
    const resumeStoragePath = `${candidateId}/${randomUUID()}.pdf`;

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());

    const { error: resumeUploadError } = await supabaseServer.storage
      .from("candidate-resumes")
      .upload(resumeStoragePath, resumeBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (resumeUploadError) {
      console.error("[submitApplication] resume upload failed", {
        message: resumeUploadError.message,
      });

      // Roll back candidate because application creation cannot continue.
      await supabase.from("candidates").delete().eq("id", candidateId);

      return {
        ...getInitialState(values),
        success: false,
        message:
          "We could not upload your resume right now. Please try again shortly.",
      };
    }
    const evidencePayload: Database["public"]["Tables"]["evidence_sources"]["Insert"] = {
      candidate_id: candidateId,
      source_type: "resume",
      storage_path: resumeStoragePath,
      original_filename: resumeFile.name,
      mime_type: resumeFile.type,
      status: "uploaded",
    };

    const { data: evidenceSourceRecord, error: evidenceError } = await supabaseServer
      .from("evidence_sources")
      .insert(evidencePayload)
      .select("id")
      .single();

    if (evidenceError) {
      console.error("[submitApplication] evidence source insert failed", {
        message: evidenceError.message,
        code: evidenceError.code,
        details: evidenceError.details,
        hint: evidenceError.hint,
      });

      await supabaseServer.storage
        .from("candidate-resumes")
        .remove([resumeStoragePath]);

      await supabase.from("candidates").delete().eq("id", candidateId);

      return {
        ...getInitialState(values),
        success: false,
        message: "We could not save your resume information right now. Please try again shortly.",
      };
    }

    if (!evidenceSourceRecord) {
      console.error("[submitApplication] evidence source insert returned no row");

      await supabaseServer.storage
        .from("candidate-resumes")
        .remove([resumeStoragePath]);

      await supabase.from("candidates").delete().eq("id", candidateId);

      return {
        ...getInitialState(values),
        success: false,
        message: "We could not save your resume information right now. Please try again shortly.",
      };
    }

    // 7. Insert application
    const applicationPayload: Database["public"]["Tables"]["applications"]["Insert"] =
      {
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

    const { error: applicationError } = await supabase
      .from("applications")
      .insert(applicationPayload);

    if (applicationError) {
      console.error("[submitApplication] application insert failed", {
        message: applicationError?.message,
        code: applicationError?.code,
        details: applicationError?.details,
        hint: applicationError?.hint,
      });

      // Clean up uploaded resume because the application failed.
      const { error: resumeCleanupError } = await supabaseServer.storage
        .from("candidate-resumes")
        .remove([resumeStoragePath]);

      if (resumeCleanupError) {
        console.error("[submitApplication] resume cleanup failed", {
          message: resumeCleanupError.message,
        });
      }

      // Clean up candidate as part of rollback.
      await supabase.from("candidates").delete().eq("id", candidateId);

      if (isDuplicateApplicationError(applicationError)) {
        return {
          ...getInitialState(values),
          success: false,
          message:
            "You have already applied for this role. We will keep your application under review.",
        };
      }

      return {
        ...getInitialState(values),
        success: false,
        message:
          "We could not submit your application right now. Please try again shortly.",
      };
    }

    const {
      data: resumeIntelligenceRecord,
      error: resumeIntelligenceInsertError,
    } = await supabaseServer
      .from("resume_intelligence")
      .insert({
        evidence_source_id: evidenceSourceRecord.id,
        extraction_status: "pending",
        extraction_error: null,
        professional_summary: null,
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      })
      .select("id")
      .single();

    if (resumeIntelligenceInsertError || !resumeIntelligenceRecord) {
      console.error("[Resume Intelligence] pending row insert failed", {
        message: resumeIntelligenceInsertError?.message,
        code: resumeIntelligenceInsertError?.code,
        details: resumeIntelligenceInsertError?.details,
        hint: resumeIntelligenceInsertError?.hint,
      });

      await supabaseServer
        .from("evidence_sources")
        .update({ status: "failed" })
        .eq("id", evidenceSourceRecord.id);
    } else {
      const markProcessingOps = await Promise.all([
        supabaseServer
          .from("resume_intelligence")
          .update({
            extraction_status: "processing",
            extraction_error: null,
          })
          .eq("id", resumeIntelligenceRecord.id),
        supabaseServer
          .from("evidence_sources")
          .update({ status: "processing" })
          .eq("id", evidenceSourceRecord.id),
      ]);

      if (markProcessingOps[0].error || markProcessingOps[1].error) {
        console.error("[Resume Intelligence] processing status update failed", {
          resumeIntelligenceError: markProcessingOps[0].error?.message,
          evidenceSourceError: markProcessingOps[1].error?.message,
        });
      }

      try {
        const { data: resumeFileData, error: resumeDownloadError } =
          await supabaseServer.storage
            .from("candidate-resumes")
            .download(resumeStoragePath);

        if (resumeDownloadError || !resumeFileData) {
          throw new Error("Resume file download failed.");
        }

        const resumeBytes = new Uint8Array(await resumeFileData.arrayBuffer());
        const extractedResume =
          await analyzeResumeFromPdfWithGemini(resumeBytes);

        const completionOps = await Promise.all([
          supabaseServer
            .from("resume_intelligence")
            .update({
              professional_summary: extractedResume.professionalSummary,
              skills: extractedResume.skills,
              experience: extractedResume.experience,
              projects: extractedResume.projects,
              education: extractedResume.education,
              certifications: extractedResume.certifications,
              extraction_status: "completed",
              extraction_error: null,
            })
            .eq("id", resumeIntelligenceRecord.id),
          supabaseServer
            .from("evidence_sources")
            .update({ status: "processed" })
            .eq("id", evidenceSourceRecord.id),
        ]);

        if (completionOps[0].error || completionOps[1].error) {
          console.error("[Resume Intelligence] completion update failed", {
            resumeIntelligenceError: completionOps[0].error?.message,
            evidenceSourceError: completionOps[1].error?.message,
          });
        }
      } catch (error) {
        const extractionError = sanitizeResumeExtractionError(error);
        console.error("[Resume Intelligence] extraction failed", {
          message: extractionError,
        });

        const failOps = await Promise.all([
          supabaseServer
            .from("resume_intelligence")
            .update({
              extraction_status: "failed",
              extraction_error: extractionError,
            })
            .eq("id", resumeIntelligenceRecord.id),
          supabaseServer
            .from("evidence_sources")
            .update({ status: "failed" })
            .eq("id", evidenceSourceRecord.id),
        ]);

        if (failOps[0].error || failOps[1].error) {
          console.error("[Resume Intelligence] failure status update failed", {
            resumeIntelligenceError: failOps[0].error?.message,
            evidenceSourceError: failOps[1].error?.message,
          });
        }
      }
    }

    // 8. Existing asynchronous AI evaluation
    void (async () => {
      try {
        const {
          data: applicationRecord,
          error: applicationLookupError,
        } = await supabaseServer
          .from("applications")
          .select("id, job_id, candidate_id, status")
          .eq("candidate_id", candidateId)
          .eq("job_id", jobId)
          .maybeSingle();

        const {
          data: candidateRecord,
          error: candidateLookupError,
        } = await supabaseServer
          .from("candidates")
          .select("skills, experience_years, profile_summary")
          .eq("id", candidateId)
          .maybeSingle();

        const {
          data: jobRecord,
          error: jobLookupError,
        } = await supabaseServer
          .from("jobs")
          .select(
            "title, department, description, requirements, required_skills, experience_level",
          )
          .eq("id", jobId)
          .maybeSingle();

        if (
          applicationLookupError ||
          candidateLookupError ||
          jobLookupError ||
          !applicationRecord ||
          !candidateRecord ||
          !jobRecord
        ) {
          console.error("[AI Evaluation] records load failed", {
            applicationLookupError: applicationLookupError?.message,
            candidateLookupError: candidateLookupError?.message,
            jobLookupError: jobLookupError?.message,
          });

          return;
        }

        console.info("[AI Evaluation] records loaded", {
          applicationId: applicationRecord.id,
        });

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

        console.info("[AI Evaluation] schema validated", {
          applicationId: applicationRecord.id,
        });

        const { error: updateError } = await supabaseServer
          .from("applications")
          .update({
            match_score: evaluation.matchScore,
            matched_skills: evaluation.matchedSkills,
            missing_skills: evaluation.missingSkills,
            strengths: evaluation.strengths,
            concerns: evaluation.concerns,
            ai_summary: evaluation.summary,
            recommendation: evaluation.recommendation,
          })
          .eq("id", applicationRecord.id);

        if (updateError) {
          console.error("[AI Evaluation] database update failed", {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint,
          });

          return;
        }

        console.info("[AI Evaluation] database update completed", {
          applicationId: applicationRecord.id,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown AI evaluation error";

        const name =
          error instanceof Error ? error.name : "UnknownError";

        console.error("[AI Evaluation] unexpected failure", {
          name,
          message,
        });
      }
    })();

    // 9. Revalidate pages
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);

    return {
      success: true,
      message:
        "Your application has been received. We will review it shortly.",
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
  } catch (error) {
    console.error("[submitApplication] unexpected failure", {
      message:
        error instanceof Error
          ? error.message
          : "Unknown application submission error",
    });

    return {
      ...getInitialState(values),
      success: false,
      message:
        "We hit a network issue while submitting your application. Please try again shortly.",
    };
  }
}
