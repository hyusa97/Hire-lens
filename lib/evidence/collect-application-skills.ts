import { normalizeSkill } from "./skill-taxonomy";
import type { CollectedSkillEvidence } from "./types";

export function collectApplicationSkillEvidence(
  skills: string[],
): CollectedSkillEvidence[] {
  const collected = new Map<string, CollectedSkillEvidence>();

  for (const rawSkill of skills) {
    const skill = normalizeSkill(rawSkill);

    if (!skill) {
      continue;
    }

    if (collected.has(skill.canonical)) {
      continue;
    }

    collected.set(skill.canonical, {
      canonicalSkill: skill.canonical,
      displayName: skill.displayName,

      origin: "application",
      evidenceType: "application_claim",
      evidenceQuality: "claimed",

      description: `Candidate listed ${skill.displayName} in the application.`,
      sourceReference: rawSkill.trim() || null,

      evidenceSourceId: null,
      repositoryEvidenceId: null,
    });
  }

  return [...collected.values()];
}