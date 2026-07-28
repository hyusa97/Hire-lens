import "server-only";

import { supabaseServer } from "../supabase/server-client";
import type { EvidenceBackedJobMatch } from "./evaluate-job-match";

export async function persistJobMatch(
  applicationId: string,
  match: EvidenceBackedJobMatch,
): Promise<void> {
  const { data: matchRecord, error: matchError } =
    await supabaseServer
      .from("application_evidence_matches")
      .upsert(
        {
          application_id: applicationId,

          total_requirements: match.summary.totalRequirements,
          evaluated_requirements: match.summary.evaluatedRequirements,

          verified_matches: match.summary.verifiedMatches,
          supported_matches: match.summary.supportedMatches,
          claimed_matches: match.summary.claimedMatches,
          missing_requirements: match.summary.missingRequirements,
          unmapped_requirements: match.summary.unmappedRequirements,

          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "application_id",
        },
      )
      .select("id")
      .single();

  if (matchError || !matchRecord) {
    throw new Error(
      matchError?.message ??
        "Could not persist application evidence match.",
    );
  }

  const { error: deleteError } = await supabaseServer
    .from("application_skill_alignments")
    .delete()
    .eq("application_match_id", matchRecord.id);

  if (deleteError) {
    throw new Error(
      `Could not clear existing skill alignments: ${deleteError.message}`,
    );
  }

  if (match.alignments.length === 0) {
    return;
  }

  const rows = match.alignments.map((alignment) => ({
    application_match_id: matchRecord.id,

    required_skill: alignment.requiredSkill,
    canonical_skill: alignment.canonicalSkill,
    display_name: alignment.displayName,

    alignment_status: alignment.status,

    claimed_in_application: alignment.claimedInApplication,
    observed_in_resume: alignment.observedInResume,
    observed_in_github: alignment.observedInGitHub,

    evidence_strength: alignment.evidenceStrength,
    verification_status: alignment.verificationStatus,

    evidence_count: alignment.evidenceCount,
    source_count: alignment.sourceCount,
  }));

  const { error: insertError } = await supabaseServer
    .from("application_skill_alignments")
    .insert(rows);

  if (insertError) {
    throw new Error(
      `Could not persist skill alignments: ${insertError.message}`,
    );
  }
}