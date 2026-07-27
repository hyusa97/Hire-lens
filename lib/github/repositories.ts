import type { GitHubRepository } from "./profile";

export type RankedGitHubRepository = GitHubRepository & {
  evidenceScore: number;
};

function calculateRepositoryScore(repository: GitHubRepository): number {
  let score = 0;

  // A repository with a description gives us more context.
  if (repository.description?.trim()) {
    score += 2;
  }

  // A detected primary language is useful technical evidence.
  if (repository.language) {
    score += 3;
  }

  // Topics provide additional technology/project context.
  score += Math.min(repository.topics.length, 3);

  // Stars/forks are weak signals, so keep their influence tiny.
  if (repository.stargazers_count > 0) {
    score += 1;
  }

  if (repository.forks_count > 0) {
    score += 1;
  }

  // Recently pushed repositories are generally more useful.
  if (repository.pushed_at) {
    const pushedAt = new Date(repository.pushed_at).getTime();
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    if (pushedAt >= oneYearAgo) {
      score += 2;
    }
  }

  return score;
}

export function selectRelevantRepositories(
  repositories: GitHubRepository[],
  limit = 8,
): RankedGitHubRepository[] {
  return repositories
    .filter((repository) => !repository.fork && !repository.archived)
    .map((repository) => ({
      ...repository,
      evidenceScore: calculateRepositoryScore(repository),
    }))
    .sort((a, b) => {
      if (b.evidenceScore !== a.evidenceScore) {
        return b.evidenceScore - a.evidenceScore;
      }

      const aUpdated = new Date(a.updated_at).getTime();
      const bUpdated = new Date(b.updated_at).getTime();

      return bUpdated - aUpdated;
    })
    .slice(0, limit);
}