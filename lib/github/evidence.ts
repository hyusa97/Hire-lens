import "server-only";

import { githubFetch, githubFetchOptional } from "./client";

type GitHubContentResponse = {
  type: string;
  name: string;
  path: string;
  content?: string;
  encoding?: string;
};

export type GitHubRepositoryEvidence = {
  languages: Record<string, number>;
  readme: string | null;
  manifests: {
    packageJson: string | null;
    requirementsTxt: string | null;
    pyprojectToml: string | null;
    dockerfile: string | null;
    dockerCompose: string | null;
  };
};

function decodeGitHubContent(
  content: GitHubContentResponse | null,
): string | null {
  if (
    !content ||
    content.type !== "file" ||
    !content.content ||
    content.encoding !== "base64"
  ) {
    return null;
  }

  return Buffer.from(content.content, "base64").toString("utf8");
}

async function getRepositoryFile(
  owner: string,
  repository: string,
  path: string,
): Promise<string | null> {
  const result = await githubFetchOptional<GitHubContentResponse>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/${path}`,
  );

  return decodeGitHubContent(result);
}

export async function getRepositoryEvidence(
  owner: string,
  repository: string,
): Promise<GitHubRepositoryEvidence> {
  const [
    languages,
    readmeResponse,
    packageJson,
    requirementsTxt,
    pyprojectToml,
    dockerfile,
    dockerCompose,
  ] = await Promise.all([
    githubFetch<Record<string, number>>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/languages`,
    ),

    githubFetchOptional<GitHubContentResponse>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/readme`,
    ),

    getRepositoryFile(owner, repository, "package.json"),
    getRepositoryFile(owner, repository, "requirements.txt"),
    getRepositoryFile(owner, repository, "pyproject.toml"),
    getRepositoryFile(owner, repository, "Dockerfile"),
    getRepositoryFile(owner, repository, "docker-compose.yml"),
  ]);

  return {
    languages,
    readme: decodeGitHubContent(readmeResponse),
    manifests: {
      packageJson,
      requirementsTxt,
      pyprojectToml,
      dockerfile,
      dockerCompose,
    },
  };
}