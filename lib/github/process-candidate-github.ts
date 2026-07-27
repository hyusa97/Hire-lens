import "server-only";

import { supabaseServer } from "@/lib/supabase/server-client";
import { extractGitHubUsername } from "./username";
import { getGitHubProfile, getGitHubRepositories } from "./profile";
import { selectRelevantRepositories } from "./repositories";
import { getRepositoryEvidence } from "./evidence";
import {
  extractPackageJsonDependencies,
  extractRequirementsDependencies,
} from "./dependencies";

function sanitizeGitHubError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return "Unknown GitHub evidence processing error.";
}

export async function processCandidateGitHub(
  candidateId: string,
  githubUrl: string,
): Promise<void> {
  const username = extractGitHubUsername(githubUrl);

  if (!username) {
    console.warn("[GitHub Evidence] invalid GitHub profile URL", {
      candidateId,
    });
    return;
  }

  console.log("[GitHub Evidence] processing started", {
    candidateId,
    username,
  });

  const { data: evidenceSource, error: evidenceSourceError } =
    await supabaseServer
      .from("evidence_sources")
      .insert({
        candidate_id: candidateId,
        source_type: "github",
        source_url: githubUrl,
        status: "processing",
      })
      .select("id")
      .single();

  if (evidenceSourceError || !evidenceSource) {
    throw new Error(
      evidenceSourceError?.message ??
        "Could not create GitHub evidence source.",
    );
  }

  let githubIntelligenceId: string | null = null;

  try {
    const [profile, repositories] = await Promise.all([
      getGitHubProfile(username),
      getGitHubRepositories(username),
    ]);

    const selectedRepositories = selectRelevantRepositories(repositories);

    const { data: githubIntelligence, error: intelligenceError } =
      await supabaseServer
        .from("github_intelligence")
        .insert({
          evidence_source_id: evidenceSource.id,
          username: profile.login,
          profile_name: profile.name,
          profile_bio: profile.bio,
          profile_url: profile.html_url,
          public_repo_count: profile.public_repos,
          repositories_analyzed: 0,
          extraction_status: "processing",
        })
        .select("id")
        .single();

    if (intelligenceError || !githubIntelligence) {
      throw new Error(
        intelligenceError?.message ??
          "Could not create GitHub intelligence record.",
      );
    }

    githubIntelligenceId = githubIntelligence.id;

    let repositoriesAnalyzed = 0;

    for (const repository of selectedRepositories) {
      try {
        console.log("[GitHub Evidence] repository processing started", {
          repository: repository.full_name,
        });

        const evidence = await getRepositoryEvidence(
          profile.login,
          repository.name,
        );

        const npmDependencies = extractPackageJsonDependencies(
          evidence.manifests.packageJson,
        );

        const pythonDependencies = extractRequirementsDependencies(
          evidence.manifests.requirementsTxt,
        );

        const { error: repositoryInsertError } = await supabaseServer
          .from("github_repository_evidence")
          .insert({
            github_intelligence_id: githubIntelligence.id,
            repository_name: repository.name,
            repository_url: repository.html_url,
            description: repository.description,
            languages: evidence.languages,
            topics: repository.topics,
            npm_dependencies: npmDependencies,
            python_dependencies: pythonDependencies,
            readme_excerpt: evidence.readme
              ? evidence.readme.slice(0, 4000)
              : null,
            has_package_json: Boolean(evidence.manifests.packageJson),
            has_requirements_txt: Boolean(
              evidence.manifests.requirementsTxt,
            ),
            has_pyproject_toml: Boolean(
              evidence.manifests.pyprojectToml,
            ),
            has_dockerfile: Boolean(evidence.manifests.dockerfile),
            has_docker_compose: Boolean(
              evidence.manifests.dockerCompose,
            ),
            evidence_score: repository.evidenceScore,
            pushed_at: repository.pushed_at,
          });

        if (repositoryInsertError) {
          throw new Error(repositoryInsertError.message);
        }

        repositoriesAnalyzed += 1;

        console.log("[GitHub Evidence] repository processing completed", {
          repository: repository.full_name,
        });
      } catch (repositoryError) {
        console.error("[GitHub Evidence] repository processing failed", {
          repository: repository.full_name,
          message: sanitizeGitHubError(repositoryError),
        });
      }
    }

    const { error: intelligenceUpdateError } = await supabaseServer
      .from("github_intelligence")
      .update({
        repositories_analyzed: repositoriesAnalyzed,
        extraction_status: "completed",
        extraction_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", githubIntelligence.id);

    if (intelligenceUpdateError) {
      throw new Error(intelligenceUpdateError.message);
    }

    const { error: sourceUpdateError } = await supabaseServer
      .from("evidence_sources")
      .update({
        status: "processed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", evidenceSource.id);

    if (sourceUpdateError) {
      throw new Error(sourceUpdateError.message);
    }

    console.log("[GitHub Evidence] processing completed", {
      candidateId,
      username,
      repositoriesAnalyzed,
    });
  } catch (error) {
    const message = sanitizeGitHubError(error);

    console.error("[GitHub Evidence] processing failed", {
      candidateId,
      username,
      message,
    });

    await supabaseServer
      .from("evidence_sources")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", evidenceSource.id);

    if (githubIntelligenceId) {
      await supabaseServer
        .from("github_intelligence")
        .update({
          extraction_status: "failed",
          extraction_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", githubIntelligenceId);
    }
  }
}