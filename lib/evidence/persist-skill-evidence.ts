import "server-only";

import { supabaseServer } from "../supabase/server-client";
import type { AggregatedSkillEvidence } from "./aggregate-skill-evidence";

export async function persistCandidateSkillEvidence(
  candidateId: string,
  skills: AggregatedSkillEvidence[],
): Promise<void> {
  // Rebuild the candidate-level aggregation from the current evidence set.
  // Deleting parent rows also removes skill_evidence_items via ON DELETE CASCADE.
  const { error: deleteError } = await supabaseServer
    .from("candidate_skill_evidence")
    .delete()
    .eq("candidate_id", candidateId);

  if (deleteError) {
    throw new Error(
      `Could not clear existing candidate skill evidence: ${deleteError.message}`,
    );
  }

  for (const skill of skills) {
    const { data: skillRecord, error: skillInsertError } =
      await supabaseServer
        .from("candidate_skill_evidence")
        .insert({
          candidate_id: candidateId,
          canonical_skill: skill.canonicalSkill,
          display_name: skill.displayName,

          claimed_in_application: skill.claimedInApplication,
          observed_in_resume: skill.observedInResume,
          observed_in_github: skill.observedInGitHub,

          evidence_strength: skill.evidenceStrength,
          verification_status: skill.verificationStatus,

          evidence_count: skill.evidenceCount,
          source_count: skill.sourceCount,
        })
        .select("id")
        .single();

    if (skillInsertError || !skillRecord) {
      throw new Error(
        skillInsertError?.message ??
          `Could not persist skill evidence for ${skill.displayName}.`,
      );
    }

    if (skill.evidence.length === 0) {
      continue;
    }

    const evidenceRows = skill.evidence.map((item) => ({
      candidate_skill_evidence_id: skillRecord.id,

      evidence_source_id: item.evidenceSourceId,
      repository_evidence_id: item.repositoryEvidenceId,

      evidence_type: item.evidenceType,
      evidence_quality: item.evidenceQuality,

      source_reference: item.sourceReference,
      description: item.description,
    }));

    const { error: evidenceInsertError } = await supabaseServer
      .from("skill_evidence_items")
      .insert(evidenceRows);

    if (evidenceInsertError) {
      throw new Error(
        `Could not persist evidence items for ${skill.displayName}: ${evidenceInsertError.message}`,
      );
    }
  }
}