export type SkillAlignmentStatus =
  | "verified_match"
  | "supported_match"
  | "claimed_match"
  | "missing"
  | "unmapped_requirement";

export type JobSkillAlignment = {
  requiredSkill: string;
  canonicalSkill: string | null;
  displayName: string;

  status: SkillAlignmentStatus;

  claimedInApplication: boolean;
  observedInResume: boolean;
  observedInGitHub: boolean;

  evidenceStrength: "weak" | "moderate" | "strong" | null;

  verificationStatus:
    | "unverified"
    | "partially_supported"
    | "supported"
    | null;

  evidenceCount: number;
  sourceCount: number;
};
export type JobMatchSummary = {
  totalRequirements: number;

  verifiedMatches: number;
  supportedMatches: number;
  claimedMatches: number;
  missingRequirements: number;
  unmappedRequirements: number;

  evaluatedRequirements: number;
};