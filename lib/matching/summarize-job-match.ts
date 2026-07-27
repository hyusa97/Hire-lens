import type {
  JobMatchSummary,
  JobSkillAlignment,
} from "./types";

export function summarizeJobMatch(
  alignments: JobSkillAlignment[],
): JobMatchSummary {
  const summary: JobMatchSummary = {
    totalRequirements: alignments.length,

    verifiedMatches: 0,
    supportedMatches: 0,
    claimedMatches: 0,
    missingRequirements: 0,
    unmappedRequirements: 0,

    evaluatedRequirements: 0,
  };

  for (const alignment of alignments) {
    switch (alignment.status) {
      case "verified_match":
        summary.verifiedMatches += 1;
        summary.evaluatedRequirements += 1;
        break;

      case "supported_match":
        summary.supportedMatches += 1;
        summary.evaluatedRequirements += 1;
        break;

      case "claimed_match":
        summary.claimedMatches += 1;
        summary.evaluatedRequirements += 1;
        break;

      case "missing":
        summary.missingRequirements += 1;
        summary.evaluatedRequirements += 1;
        break;

      case "unmapped_requirement":
        summary.unmappedRequirements += 1;
        break;
    }
  }

  return summary;
}