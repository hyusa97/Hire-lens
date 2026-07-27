import { normalizeSkill } from "./skill-taxonomy";
import type { CollectedSkillEvidence } from "./types";
import type { ResumeIntelligence } from "../supabase/types";

export function collectResumeSkillEvidence(
  resume: ResumeIntelligence,
): CollectedSkillEvidence[] {
  const evidence: CollectedSkillEvidence[] = [];

  // Explicit resume skill claims
  for (const resumeSkill of resume.skills) {
    const skill = normalizeSkill(resumeSkill.name);

    if (!skill) {
      continue;
    }

    evidence.push({
      canonicalSkill: skill.canonical,
      displayName: skill.displayName,

      origin: "resume",
      evidenceType: "resume_skill",
      evidenceQuality: "claimed",

      description: `Resume lists ${skill.displayName} as a skill.`,
      sourceReference: resumeSkill.name,

      evidenceSourceId: resume.evidence_source_id,
      repositoryEvidenceId: null,
    });
  }

  // Skills associated with work experience
  for (const experience of resume.experience) {
    for (const rawSkill of experience.skills) {
      const skill = normalizeSkill(rawSkill);

      if (!skill) {
        continue;
      }

      evidence.push({
        canonicalSkill: skill.canonical,
        displayName: skill.displayName,

        origin: "resume",
        evidenceType: "resume_experience",
        evidenceQuality: "contextual",

        description:
          `${skill.displayName} is associated with the ` +
          `${experience.role} experience at ${experience.company}.`,

        sourceReference: `${experience.company} — ${experience.role}`,

        evidenceSourceId: resume.evidence_source_id,
        repositoryEvidenceId: null,
      });
    }
  }

  // Technologies associated with projects
  for (const project of resume.projects) {
    for (const technology of project.technologies) {
      const skill = normalizeSkill(technology);

      if (!skill) {
        continue;
      }

      evidence.push({
        canonicalSkill: skill.canonical,
        displayName: skill.displayName,

        origin: "resume",
        evidenceType: "resume_project",
        evidenceQuality: "contextual",

        description:
          `${skill.displayName} is associated with resume project ` +
          `"${project.name}".`,

        sourceReference: project.name,

        evidenceSourceId: resume.evidence_source_id,
        repositoryEvidenceId: null,
      });
    }
  }

  return deduplicateResumeEvidence(evidence);
}

function deduplicateResumeEvidence(
  evidence: CollectedSkillEvidence[],
): CollectedSkillEvidence[] {
  const seen = new Set<string>();

  return evidence.filter((item) => {
    const key = [
      item.canonicalSkill,
      item.evidenceType,
      item.sourceReference ?? "",
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}