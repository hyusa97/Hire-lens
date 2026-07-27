export function extractGitHubUsername(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname !== "github.com" &&
      parsed.hostname !== "www.github.com"
    ) {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length !== 1) {
      return null;
    }

    const username = parts[0];

    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
      return null;
    }

    return username;
  } catch {
    return null;
  }
}