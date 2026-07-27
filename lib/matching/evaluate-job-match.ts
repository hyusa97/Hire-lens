import "server-only";

import { loadCandidateSkillEvidence } from "./load-candidate-skill-evidence";
import { matchJobSkills } from "./match-job-skills";
import { summarizeJobMatch } from "./summarize-job-match";
import type {
  JobMatchSummary,
  JobSkillAlignment,
} from "./types";

export type EvidenceBackedJobMatch = {
  alignments: JobSkillAlignment[];
  summary: JobMatchSummary;
};

export async function evaluateJobMatch(
  candidateId: string,
  requiredSkills: string[],
): Promise<EvidenceBackedJobMatch> {
  const candidateEvidence =
    await loadCandidateSkillEvidence(candidateId);

  const alignments = matchJobSkills(
    requiredSkills,
    candidateEvidence,
  );

  const summary = summarizeJobMatch(alignments);

  return {
    alignments,
    summary,
  };
}