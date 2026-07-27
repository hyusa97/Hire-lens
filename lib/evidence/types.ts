export type EvidenceOrigin = "application" | "resume" | "github";

export type SkillEvidenceType =
  | "application_claim"
  | "resume_skill"
  | "resume_project"
  | "resume_experience"
  | "github_language"
  | "github_dependency"
  | "github_topic"
  | "github_readme";

export type SkillEvidenceQuality =
  | "claimed"
  | "contextual"
  | "artifact";

export type CollectedSkillEvidence = {
  canonicalSkill: string;
  displayName: string;

  origin: EvidenceOrigin;
  evidenceType: SkillEvidenceType;
  evidenceQuality: SkillEvidenceQuality;

  description: string;
  sourceReference: string | null;

  evidenceSourceId: string | null;
  repositoryEvidenceId: string | null;
};