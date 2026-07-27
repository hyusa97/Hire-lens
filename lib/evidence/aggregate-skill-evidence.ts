import type { CollectedSkillEvidence } from "./types";

export type EvidenceStrength = "weak" | "moderate" | "strong";

export type VerificationStatus =
  | "unverified"
  | "partially_supported"
  | "supported";

export type AggregatedSkillEvidence = {
  canonicalSkill: string;
  displayName: string;

  claimedInApplication: boolean;
  observedInResume: boolean;
  observedInGitHub: boolean;

  evidenceStrength: EvidenceStrength;
  verificationStatus: VerificationStatus;

  evidenceCount: number;
  sourceCount: number;

  evidence: CollectedSkillEvidence[];
};

export function aggregateSkillEvidence(
  evidence: CollectedSkillEvidence[],
): AggregatedSkillEvidence[] {
  const grouped = new Map<string, CollectedSkillEvidence[]>();

  for (const item of evidence) {
    const existing = grouped.get(item.canonicalSkill) ?? [];
    existing.push(item);
    grouped.set(item.canonicalSkill, existing);
  }

  return [...grouped.entries()].map(
    ([canonicalSkill, items]) => {
      const first = items[0];

      if (!first) {
        throw new Error(
          `Cannot aggregate empty evidence group for ${canonicalSkill}.`,
        );
      }

      const origins = new Set(items.map((item) => item.origin));
      const qualities = new Set(
        items.map((item) => item.evidenceQuality),
      );

      const claimedInApplication = origins.has("application");
      const observedInResume = origins.has("resume");
      const observedInGitHub = origins.has("github");

      return {
        canonicalSkill,
        displayName: first.displayName,

        claimedInApplication,
        observedInResume,
        observedInGitHub,

        evidenceStrength: determineEvidenceStrength(
          items,
          origins,
          qualities,
        ),

        verificationStatus: determineVerificationStatus(
          claimedInApplication,
          observedInResume,
          observedInGitHub,
        ),

        evidenceCount: items.length,
        sourceCount: origins.size,

        evidence: items,
      };
    },
  );
}

function determineVerificationStatus(
  claimedInApplication: boolean,
  observedInResume: boolean,
  observedInGitHub: boolean,
): VerificationStatus {
  const independentSources =
    Number(observedInResume) + Number(observedInGitHub);

  if (claimedInApplication) {
    if (independentSources >= 2) {
      return "supported";
    }

    if (independentSources === 1) {
      return "partially_supported";
    }

    return "unverified";
  }

  // Observed skills do not need an application claim to be useful.
  if (independentSources >= 2) {
    return "supported";
  }

  return "partially_supported";
}

function determineEvidenceStrength(
  items: CollectedSkillEvidence[],
  origins: Set<CollectedSkillEvidence["origin"]>,
  qualities: Set<CollectedSkillEvidence["evidenceQuality"]>,
): EvidenceStrength {
  const hasArtifactEvidence = qualities.has("artifact");
  const hasContextualEvidence = qualities.has("contextual");

  // Independent source convergence is strongest.
  if (
    origins.has("resume") &&
    origins.has("github") &&
    (hasArtifactEvidence || hasContextualEvidence)
  ) {
    return "strong";
  }

  // Multiple GitHub repositories with artifact evidence also matter.
  const artifactRepositories = new Set(
    items
      .filter(
        (item) =>
          item.origin === "github" &&
          item.evidenceQuality === "artifact" &&
          item.repositoryEvidenceId,
      )
      .map((item) => item.repositoryEvidenceId),
  );

  if (artifactRepositories.size >= 2) {
    return "strong";
  }

  // One meaningful corroborating observation is moderate.
  if (
    hasArtifactEvidence ||
    hasContextualEvidence ||
    origins.size >= 2
  ) {
    return "moderate";
  }

  return "weak";
}