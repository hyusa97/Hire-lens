import type { CandidateSkillEvidence } from "../supabase/types";
import { normalizeSkill } from "../evidence/skill-taxonomy";
import type {
  JobSkillAlignment,
  SkillAlignmentStatus,
} from "./types";

function determineAlignmentStatus(
  evidence: CandidateSkillEvidence,
): SkillAlignmentStatus {
  if (
    evidence.verification_status === "supported" &&
    evidence.evidence_strength === "strong"
  ) {
    return "verified_match";
  }

  if (
    evidence.observed_in_resume ||
    evidence.observed_in_github
  ) {
    return "supported_match";
  }

  if (evidence.claimed_in_application) {
    return "claimed_match";
  }

  return "missing";
}

export function matchJobSkills(
  requiredSkills: string[],
  candidateEvidence: CandidateSkillEvidence[],
): JobSkillAlignment[] {
  const evidenceBySkill = new Map(
    candidateEvidence.map((evidence) => [
      evidence.canonical_skill,
      evidence,
    ]),
  );

  return requiredSkills.map((requiredSkill) => {
    const normalized = normalizeSkill(requiredSkill);

    if (!normalized) {
      return {
        requiredSkill,
        canonicalSkill: null,
        displayName: requiredSkill,
        status: "unmapped_requirement",

        claimedInApplication: false,
        observedInResume: false,
        observedInGitHub: false,

        evidenceStrength: null,
        verificationStatus: null,

        evidenceCount: 0,
        sourceCount: 0,
      };
    }

    const evidence = evidenceBySkill.get(normalized.canonical);

    if (!evidence) {
      return {
        requiredSkill,
        canonicalSkill: normalized.canonical,
        displayName: normalized.displayName,
        status: "missing",

        claimedInApplication: false,
        observedInResume: false,
        observedInGitHub: false,

        evidenceStrength: null,
        verificationStatus: null,

        evidenceCount: 0,
        sourceCount: 0,
      };
    }

    return {
      requiredSkill,
      canonicalSkill: normalized.canonical,
      displayName: normalized.displayName,

      status: determineAlignmentStatus(evidence),

      claimedInApplication: evidence.claimed_in_application,
      observedInResume: evidence.observed_in_resume,
      observedInGitHub: evidence.observed_in_github,

      evidenceStrength: evidence.evidence_strength,
      verificationStatus: evidence.verification_status,

      evidenceCount: evidence.evidence_count,
      sourceCount: evidence.source_count,
    };
  });
}