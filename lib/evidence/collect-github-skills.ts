import { normalizeSkill } from "./skill-taxonomy";
import type { CollectedSkillEvidence } from "./types";
import type {
  EvidenceSource,
  GitHubRepositoryEvidence,
} from "../supabase/types";

export function collectGitHubSkillEvidence(
  evidenceSource: EvidenceSource,
  repositories: GitHubRepositoryEvidence[],
): CollectedSkillEvidence[] {
  const evidence: CollectedSkillEvidence[] = [];

  for (const repository of repositories) {
    // Repository languages are direct artifact evidence.
    for (const language of Object.keys(repository.languages)) {
      const skill = normalizeSkill(language);

      if (!skill) {
        continue;
      }

      evidence.push({
        canonicalSkill: skill.canonical,
        displayName: skill.displayName,

        origin: "github",
        evidenceType: "github_language",
        evidenceQuality: "artifact",

        description:
          `${skill.displayName} is present in repository ` +
          `"${repository.repository_name}".`,

        sourceReference: repository.repository_name,

        evidenceSourceId: evidenceSource.id,
        repositoryEvidenceId: repository.id,
      });
    }

    // npm dependencies can directly identify technologies.
    for (const dependency of repository.npm_dependencies) {
      const skill = normalizeGitHubDependency(dependency);

      if (!skill) {
        continue;
      }

      evidence.push({
        canonicalSkill: skill.canonical,
        displayName: skill.displayName,

        origin: "github",
        evidenceType: "github_dependency",
        evidenceQuality: "artifact",

        description:
          `${skill.displayName} appears as a dependency in ` +
          `"${repository.repository_name}".`,

        sourceReference: `${repository.repository_name}: package.json`,

        evidenceSourceId: evidenceSource.id,
        repositoryEvidenceId: repository.id,
      });
    }

    // Python dependencies are treated the same way.
    for (const dependency of repository.python_dependencies) {
      const skill = normalizeGitHubDependency(dependency);

      if (!skill) {
        continue;
      }

      evidence.push({
        canonicalSkill: skill.canonical,
        displayName: skill.displayName,

        origin: "github",
        evidenceType: "github_dependency",
        evidenceQuality: "artifact",

        description:
          `${skill.displayName} appears as a dependency in ` +
          `"${repository.repository_name}".`,

        sourceReference: `${repository.repository_name}: Python manifest`,

        evidenceSourceId: evidenceSource.id,
        repositoryEvidenceId: repository.id,
      });
    }

    // Topics are contextual rather than implementation artifacts.
    for (const topic of repository.topics) {
      const skill = normalizeSkill(topic);

      if (!skill) {
        continue;
      }

      evidence.push({
        canonicalSkill: skill.canonical,
        displayName: skill.displayName,

        origin: "github",
        evidenceType: "github_topic",
        evidenceQuality: "contextual",

        description:
          `${skill.displayName} appears as a topic on repository ` +
          `"${repository.repository_name}".`,

        sourceReference: repository.repository_name,

        evidenceSourceId: evidenceSource.id,
        repositoryEvidenceId: repository.id,
      });
    }
  }

  return deduplicateGitHubEvidence(evidence);
}

function normalizeGitHubDependency(dependency: string) {
  const cleaned = dependency
    .trim()
    .toLowerCase()
    .replace(/^@/, "");

  const direct = normalizeSkill(cleaned);

  if (direct) {
    return direct;
  }

  const dependencyAliases: Record<string, string> = {
    "supabase/supabase-js": "supabase",
    "supabase-js": "supabase",

    "react-dom": "react",

    "next": "next.js",

    "scikit_learn": "scikit-learn",
    "scikit-learn": "scikit-learn",

    "torch": "pytorch",
  };

  const mapped = dependencyAliases[cleaned];

  if (!mapped) {
    return null;
  }

  return normalizeSkill(mapped);
}

function deduplicateGitHubEvidence(
  evidence: CollectedSkillEvidence[],
): CollectedSkillEvidence[] {
  const seen = new Set<string>();

  return evidence.filter((item) => {
    const key = [
      item.canonicalSkill,
      item.evidenceType,
      item.repositoryEvidenceId ?? "",
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}