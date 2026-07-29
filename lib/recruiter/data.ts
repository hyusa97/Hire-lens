//import "server-only";
//import { supabaseServer } from "../supabase/server-client";
import "server-only";
import { supabaseServer } from "../supabase/server-client";
import { createAuthServerClient } from "../supabase/auth-server";
import type {
  ResumeSkill,
  ResumeExperience,
  ResumeProject,
  ResumeEducation,
  ResumeCertification,
} from "../supabase/types";

async function getAuthenticatedRecruiterJobIds(): Promise<string[]> {
  const authSupabase = await createAuthServerClient();

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data: jobs, error: jobsError } = await supabaseServer
    .from("jobs")
    .select("id")
    .eq("recruiter_id", user.id);

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  return (jobs ?? []).map((job) => job.id);
}

export type RecruiterApplicationSummary = {
  id: string;
  status: string;
  created_at: string;
  match_score: number | null;
  recommendation: string | null;
  job_title: string | null;
  candidate_name: string | null;
};

export type RecruiterSkillEvidenceItem = {
  evidence_type:
    | "application_claim"
    | "resume_skill"
    | "resume_project"
    | "resume_experience"
    | "github_language"
    | "github_dependency"
    | "github_topic"
    | "github_readme";

  evidence_quality:
    | "claimed"
    | "contextual"
    | "artifact";

  source_reference: string | null;
  description: string;
};

export type RecruiterSkillAlignment = {
  required_skill: string;
  canonical_skill: string | null;
  display_name: string;

  alignment_status:
    | "verified_match"
    | "supported_match"
    | "claimed_match"
    | "missing"
    | "unmapped_requirement";

  claimed_in_application: boolean;
  observed_in_resume: boolean;
  observed_in_github: boolean;

  evidence_strength: "weak" | "moderate" | "strong" | null;

  verification_status:
    | "unverified"
    | "partially_supported"
    | "supported"
    | null;

  evidence_count: number;
  source_count: number;

  evidence_items: RecruiterSkillEvidenceItem[];
  
};

export type RecruiterEvidenceMatch = {
  total_requirements: number;
  evaluated_requirements: number;

  verified_matches: number;
  supported_matches: number;
  claimed_matches: number;
  missing_requirements: number;
  unmapped_requirements: number;

  alignments: RecruiterSkillAlignment[];
};

export type RecruiterDashboardStats = {
  activeJobs: number;
  totalApplications: number;
  shortlistedApplications: number;
  pendingReviewCount: number;
  averageMatchScore: number | null;
};

export async function getRecruiterDashboardStats(): Promise<RecruiterDashboardStats> {
  const recruiterJobIds = await getAuthenticatedRecruiterJobIds();

  if (recruiterJobIds.length === 0) {
    return {
      activeJobs: 0,
      totalApplications: 0,
      shortlistedApplications: 0,
      pendingReviewCount: 0,
      averageMatchScore: null,
    };
  }

  const [
    { count: activeJobs },
    { count: totalApplications },
    { count: shortlistedApplications },
    { count: pendingReviewCount },
    { data: applications, error: applicationsError },
  ] = await Promise.all([
    supabaseServer
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .in("id", recruiterJobIds),

    supabaseServer
      .from("applications")
      .select("id", { count: "exact", head: true })
      .in("job_id", recruiterJobIds),

    supabaseServer
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "shortlisted")
      .in("job_id", recruiterJobIds),

    supabaseServer
      .from("applications")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "reviewing"])
      .in("job_id", recruiterJobIds),

    supabaseServer
      .from("applications")
      .select("match_score")
      .not("match_score", "is", null)
      .in("job_id", recruiterJobIds),
  ]);

  if (applicationsError) {
    throw new Error(applicationsError.message);
  }

  const validScores = (applications ?? []).flatMap((application) =>
    typeof application.match_score === "number"
      ? [application.match_score]
      : [],
  );

  const averageMatchScore =
    validScores.length > 0
      ? validScores.reduce((sum, score) => sum + score, 0) /
        validScores.length
      : null;

  return {
    activeJobs: activeJobs ?? 0,
    totalApplications: totalApplications ?? 0,
    shortlistedApplications: shortlistedApplications ?? 0,
    pendingReviewCount: pendingReviewCount ?? 0,
    averageMatchScore,
  };
}

export type RecruiterDashboardData = {
  activeJobs: number;
  totalApplications: number;
  shortlistedCount: number;
  pendingReviewCount: number;
  averageMatchScore: number | null;
  recentApplications: RecruiterApplicationSummary[];
};

export async function getRecruiterDashboardData(): Promise<RecruiterDashboardData> {
  const [stats, recentApplications] = await Promise.all([getRecruiterDashboardStats(), getRecentApplications(8)]);

  return {
    activeJobs: stats.activeJobs,
    totalApplications: stats.totalApplications,
    shortlistedCount: stats.shortlistedApplications,
    pendingReviewCount: stats.pendingReviewCount,
    averageMatchScore: stats.averageMatchScore,
    recentApplications,
  };
}

export async function getRecruiterApplications(
  limit = 100,
): Promise<RecruiterApplicationSummary[]> {
  return getRecentApplications(limit);
}

export type RecruiterApplicationDetail = {
  id: string;
  status: string;
  created_at: string;
  match_score: number | null;
  recommendation: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  strengths: string[] | null;
  concerns: string[] | null;
  ai_summary: string | null;

  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    skills: string[] | null;
    experience_years: number | null;
    profile_summary: string | null;
    github_url: string | null;
    portfolio_url: string | null;
  } | null;

  job: {
    id: string;
    title: string;
    department: string | null;
    location: string | null;
    required_skills: string[] | null;
  } | null;

  resumeEvidence: {
    sourceId: string;
    filename: string | null;
    sourceStatus: "uploaded" | "processing" | "processed" | "failed";
    extractionStatus: "pending" | "processing" | "completed" | "failed";
    extractionError: string | null;
    professionalSummary: string | null;
    skills: ResumeSkill[];
    experience: ResumeExperience[];
    projects: ResumeProject[];
    education: ResumeEducation[];
    certifications: ResumeCertification[];
  } | null;

  evidenceMatch: RecruiterEvidenceMatch | null;
};

export async function getRecruiterApplicationById(
  applicationId: string,
): Promise<RecruiterApplicationDetail | null> {
    const recruiterJobIds = await getAuthenticatedRecruiterJobIds();

  if (recruiterJobIds.length === 0) {
    return null;
  }
  const { data: application, error } = await supabaseServer
    .from("applications")
    .select(
      "id, status, created_at, match_score, recommendation, matched_skills, missing_skills, strengths, concerns, ai_summary, candidate_id, job_id",
    )
    .eq("id", applicationId)
    .in("job_id", recruiterJobIds)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!application) {
    return null;
  }

  const [
    { data: candidate },
    { data: job },
    { data: resumeSource },
    { data: evidenceMatch },
  ] = await Promise.all([
    supabaseServer
      .from("candidates")
      .select(
        "id, name, email, phone, skills, experience_years, profile_summary, github_url, portfolio_url",
      )
      .eq("id", application.candidate_id)
      .maybeSingle(),

    supabaseServer
      .from("jobs")
      .select("id, title, department, location, required_skills")
      .eq("id", application.job_id)
      .maybeSingle(),

    supabaseServer
      .from("evidence_sources")
      .select("id, original_filename, status")
      .eq("candidate_id", application.candidate_id)
      .eq("source_type", "resume")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseServer
      .from("application_evidence_matches")
      .select(
        "id, total_requirements, evaluated_requirements, verified_matches, supported_matches, claimed_matches, missing_requirements, unmapped_requirements",
      )
      .eq("application_id", applicationId)
      .maybeSingle(),
  ]);

  const { data: resumeIntelligence } = resumeSource
    ? await supabaseServer
        .from("resume_intelligence")
        .select(
          "professional_summary, skills, experience, projects, education, certifications, extraction_status, extraction_error",
        )
        .eq("evidence_source_id", resumeSource.id)
        .maybeSingle()
    : { data: null };

  let skillAlignments: RecruiterSkillAlignment[] = [];

if (evidenceMatch) {
  const { data: alignmentRows, error: alignmentError } =
    await supabaseServer
      .from("application_skill_alignments")
      .select(
        "required_skill, canonical_skill, display_name, alignment_status, claimed_in_application, observed_in_resume, observed_in_github, evidence_strength, verification_status, evidence_count, source_count",
      )
      .eq("application_match_id", evidenceMatch.id)
      .order("required_skill");

  if (alignmentError) {
    console.error("[Recruiter] skill alignments load failed", {
      applicationId,
      message: alignmentError.message,
    });
  } else {
    const alignments = alignmentRows ?? [];

const canonicalSkills = alignments
  .map((alignment) => alignment.canonical_skill)
  .filter((skill): skill is string => skill !== null);

if (canonicalSkills.length === 0) {
  skillAlignments = alignments.map((alignment) => ({
    ...alignment,
    evidence_items: [],
  }));
} else {
  const { data: candidateSkillRows, error: candidateSkillError } =
    await supabaseServer
      .from("candidate_skill_evidence")
      .select("id, canonical_skill")
      .eq("candidate_id", application.candidate_id)
      .in("canonical_skill", canonicalSkills);

  if (candidateSkillError) {
    console.error("[Recruiter] candidate skill evidence load failed", {
      applicationId,
      message: candidateSkillError.message,
    });

    skillAlignments = alignments.map((alignment) => ({
      ...alignment,
      evidence_items: [],
    }));
  } else {
  const candidateSkills = candidateSkillRows ?? [];
  const candidateSkillIds = candidateSkills.map((skill) => skill.id);

  if (candidateSkillIds.length === 0) {
    skillAlignments = alignments.map((alignment) => ({
      ...alignment,
      evidence_items: [],
    }));
  } else {
    const { data: evidenceRows, error: evidenceError } =
      await supabaseServer
        .from("skill_evidence_items")
        .select(
          "candidate_skill_evidence_id, evidence_type, evidence_quality, source_reference, description",
        )
        .in("candidate_skill_evidence_id", candidateSkillIds);

    if (evidenceError) {
      console.error("[Recruiter] skill evidence items load failed", {
        applicationId,
        message: evidenceError.message,
      });

      skillAlignments = alignments.map((alignment) => ({
        ...alignment,
        evidence_items: [],
      }));
    } else {
      const evidenceBySkillId = new Map<
        string,
        RecruiterSkillEvidenceItem[]
      >();

      for (const item of evidenceRows ?? []) {
        const existing =
          evidenceBySkillId.get(item.candidate_skill_evidence_id) ?? [];

        existing.push({
          evidence_type: item.evidence_type,
          evidence_quality: item.evidence_quality,
          source_reference: item.source_reference,
          description: item.description,
        });

        evidenceBySkillId.set(
          item.candidate_skill_evidence_id,
          existing,
        );
      }

      const skillIdByCanonical = new Map(
        candidateSkills.map((skill) => [
          skill.canonical_skill,
          skill.id,
        ]),
      );

      skillAlignments = alignments.map((alignment) => {
        const skillId = alignment.canonical_skill
          ? skillIdByCanonical.get(alignment.canonical_skill)
          : undefined;

        return {
          ...alignment,
          evidence_items: skillId
            ? evidenceBySkillId.get(skillId) ?? []
            : [],
        };
      });
    }
  }
}} 
}}

  return {
    id: application.id,
    status: application.status,
    created_at: application.created_at,
    match_score: application.match_score,
    recommendation: application.recommendation,
    matched_skills: application.matched_skills,
    missing_skills: application.missing_skills,
    strengths: application.strengths,
    concerns: application.concerns,
    ai_summary: application.ai_summary,

    candidate: candidate
      ? {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          skills: candidate.skills,
          experience_years: candidate.experience_years,
          profile_summary: candidate.profile_summary,
          github_url: candidate.github_url,
          portfolio_url: candidate.portfolio_url,
        }
      : null,

    job: job
      ? {
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location,
          required_skills: job.required_skills,
        }
      : null,

    resumeEvidence:
      resumeSource && resumeIntelligence
        ? {
            sourceId: resumeSource.id,
            filename: resumeSource.original_filename,
            sourceStatus: resumeSource.status,
            extractionStatus: resumeIntelligence.extraction_status,
            extractionError: resumeIntelligence.extraction_error,
            professionalSummary: resumeIntelligence.professional_summary,
            skills: resumeIntelligence.skills,
            experience: resumeIntelligence.experience,
            projects: resumeIntelligence.projects,
            education: resumeIntelligence.education,
            certifications: resumeIntelligence.certifications,
          }
        : null,

      evidenceMatch: evidenceMatch
  ? {
      total_requirements: evidenceMatch.total_requirements,
      evaluated_requirements: evidenceMatch.evaluated_requirements,
      verified_matches: evidenceMatch.verified_matches,
      supported_matches: evidenceMatch.supported_matches,
      claimed_matches: evidenceMatch.claimed_matches,
      missing_requirements: evidenceMatch.missing_requirements,
      unmapped_requirements: evidenceMatch.unmapped_requirements,
      alignments: skillAlignments,
    }
  : null,
  };
}

export async function getRecentApplications(
  limit = 8,
): Promise<RecruiterApplicationSummary[]> {
  const recruiterJobIds = await getAuthenticatedRecruiterJobIds();
  if (recruiterJobIds.length === 0) {
    return [];
  }
  const { data, error } = await supabaseServer
    .from("applications")
    .select(
      "id, status, created_at, match_score, recommendation, job_id, candidate_id",
    )
    .in("job_id", recruiterJobIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const candidateIds = [
    ...new Set(
      data
        .map((application) => application.candidate_id)
        .filter(Boolean),
    ),
  ];

  const jobIds = [
    ...new Set(
      data
        .map((application) => application.job_id)
        .filter(Boolean),
    ),
  ];

  const [{ data: candidates }, { data: jobs }] = await Promise.all([
    supabaseServer
      .from("candidates")
      .select("id, name")
      .in("id", candidateIds),

    supabaseServer
      .from("jobs")
      .select("id, title")
      .in("id", jobIds),
  ]);

  const candidateMap = new Map(
    (candidates ?? []).map((candidate) => [
      candidate.id,
      candidate.name,
    ]),
  );

  const jobMap = new Map(
    (jobs ?? []).map((job) => [
      job.id,
      job.title,
    ]),
  );

  return (data ?? []).map((application) => ({
    id: application.id,
    status: application.status,
    created_at: application.created_at,
    match_score: application.match_score,
    recommendation: application.recommendation,
    job_title: application.job_id
      ? jobMap.get(application.job_id) ?? null
      : null,
    candidate_name: application.candidate_id
      ? candidateMap.get(application.candidate_id) ?? null
      : null,
  }));
}

export async function updateRecruiterApplicationStatus(
  applicationId: string,
  status: "pending" | "reviewing" | "shortlisted" | "rejected",
) {
  const recruiterJobIds = await getAuthenticatedRecruiterJobIds();

  if (recruiterJobIds.length === 0) {
    throw new Error("Application not found or access denied.");
  }

  const { data: updatedApplication, error } = await supabaseServer
    .from("applications")
    .update({
      status,
    })
    .eq("id", applicationId)
    .in("job_id", recruiterJobIds)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!updatedApplication) {
    throw new Error("Application not found or access denied.");
  }
}