import "server-only";

import { supabaseServer } from "../supabase/server-client";
import { collectApplicationSkillEvidence } from "./collect-application-skills";
import { collectResumeSkillEvidence } from "./collect-resume-skills";
import { collectGitHubSkillEvidence } from "./collect-github-skills";
import { aggregateSkillEvidence } from "./aggregate-skill-evidence";
import { persistCandidateSkillEvidence } from "./persist-skill-evidence";
import type {
  EvidenceSource,
  GitHubRepositoryEvidence,
  ResumeIntelligence,
} from "../supabase/types";
import type { CollectedSkillEvidence } from "./types";

export async function buildCandidateSkillEvidence(
  candidateId: string,
): Promise<void> {
  console.log("[Skill Evidence] build started", {
    candidateId,
  });

  const collected: CollectedSkillEvidence[] = [];

  // 1. Candidate application claims
  const { data: candidate, error: candidateError } =
    await supabaseServer
      .from("candidates")
      .select("skills")
      .eq("id", candidateId)
      .single();

  if (candidateError || !candidate) {
    throw new Error(
      candidateError?.message ??
        "Could not load candidate for skill evidence.",
    );
  }

  collected.push(
    ...collectApplicationSkillEvidence(candidate.skills ?? []),
  );

  // 2. Resume evidence
  const { data: resumeSources, error: resumeSourcesError } =
    await supabaseServer
      .from("evidence_sources")
      .select("*")
      .eq("candidate_id", candidateId)
      .eq("source_type", "resume")
      .eq("status", "processed");

  if (resumeSourcesError) {
    throw new Error(resumeSourcesError.message);
  }

  for (const source of (resumeSources ?? []) as EvidenceSource[]) {
    const { data: resume, error: resumeError } =
      await supabaseServer
        .from("resume_intelligence")
        .select("*")
        .eq("evidence_source_id", source.id)
        .eq("extraction_status", "completed")
        .maybeSingle();

    if (resumeError) {
      throw new Error(resumeError.message);
    }

    if (!resume) {
      continue;
    }

    collected.push(
      ...collectResumeSkillEvidence(
        resume as ResumeIntelligence,
      ),
    );
  }

  // 3. GitHub evidence
  const { data: githubSources, error: githubSourcesError } =
    await supabaseServer
      .from("evidence_sources")
      .select("*")
      .eq("candidate_id", candidateId)
      .eq("source_type", "github")
      .eq("status", "processed");

  if (githubSourcesError) {
    throw new Error(githubSourcesError.message);
  }

  for (const source of (githubSources ?? []) as EvidenceSource[]) {
    const { data: intelligence, error: intelligenceError } =
      await supabaseServer
        .from("github_intelligence")
        .select("id")
        .eq("evidence_source_id", source.id)
        .eq("extraction_status", "completed")
        .maybeSingle();

    if (intelligenceError) {
      throw new Error(intelligenceError.message);
    }

    if (!intelligence) {
      continue;
    }

    const { data: repositories, error: repositoriesError } =
      await supabaseServer
        .from("github_repository_evidence")
        .select("*")
        .eq("github_intelligence_id", intelligence.id);

    if (repositoriesError) {
      throw new Error(repositoriesError.message);
    }

    collected.push(
      ...collectGitHubSkillEvidence(
        source,
        (repositories ?? []) as GitHubRepositoryEvidence[],
      ),
    );
  }

  // 4. Aggregate all evidence by canonical skill.
  const aggregated = aggregateSkillEvidence(collected);

  // 5. Persist the materialized candidate-level view.
  await persistCandidateSkillEvidence(
    candidateId,
    aggregated,
  );

  console.log("[Skill Evidence] build completed", {
    candidateId,
    collectedEvidenceItems: collected.length,
    aggregatedSkills: aggregated.length,
  });
}