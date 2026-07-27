export function parseJsonResponse(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  if (!cleaned) {
    throw new Error("AI response was empty.");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned malformed JSON.");
  }
}