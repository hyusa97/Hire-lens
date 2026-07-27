export type RepositoryDependencies = {
  npm: string[];
  python: string[];
};

export function extractPackageJsonDependencies(
  content: string | null,
): string[] {
  if (!content) {
    return [];
  }

  try {
    const parsed = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    return Array.from(
      new Set([
        ...Object.keys(parsed.dependencies ?? {}),
        ...Object.keys(parsed.devDependencies ?? {}),
      ]),
    ).sort();
  } catch {
    return [];
  }
}

export function extractRequirementsDependencies(
  content: string | null,
): string[] {
  if (!content) {
    return [];
  }

  return Array.from(
    new Set(
      content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(
          (line) =>
            line &&
            !line.startsWith("#") &&
            !line.startsWith("-"),
        )
        .map((line) => line.split(/[<>=!~\[]/)[0].trim())
        .filter(Boolean),
    ),
  ).sort();
}