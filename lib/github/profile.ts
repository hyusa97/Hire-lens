import "server-only";
import { githubFetch } from "./client";

export type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  pushed_at: string | null;
};

export async function getGitHubProfile(username: string) {
  return githubFetch<GitHubProfile>(
    `/users/${encodeURIComponent(username)}`,
  );
}

export async function getGitHubRepositories(username: string) {
  return githubFetch<GitHubRepository[]>(
    `/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100`,
  );
}