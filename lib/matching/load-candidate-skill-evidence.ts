import "server-only";

import { supabaseServer } from "../supabase/server-client";
import type { CandidateSkillEvidence } from "../supabase/types";

export async function loadCandidateSkillEvidence(
  candidateId: string,
): Promise<CandidateSkillEvidence[]> {
  const { data, error } = await supabaseServer
    .from("candidate_skill_evidence")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("canonical_skill");

  if (error) {
    throw new Error(
      `Could not load candidate skill evidence: ${error.message}`,
    );
  }

  return (data ?? []) as CandidateSkillEvidence[];
}