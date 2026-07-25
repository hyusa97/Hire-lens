import "server-only";
import { gemini } from "./client";
import { buildEvaluationPrompt } from "./prompts";
import { evaluationSchema, type EvaluationResult } from "./schema";

const MODEL_NAME = "gemini-3.5-flash-lite";
const TIMEOUT_MS = 10_000;

function normalizeRecord(value: unknown): EvaluationResult {
  const parsed = evaluationSchema.safeParse(value);
  if (!parsed.success) {
    console.error("[AI Evaluation] schema validation failed", {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
    throw new Error(parsed.error.issues.map((issue) => issue.message).join("; "));
  }

  return parsed.data;
}

export async function analyzeCandidateWithGemini(job: {
  title: string;
  department: string | null;
  description: string | null;
  requirements: string | null;
  requiredSkills: string[] | null;
  experienceLevel: string | null;
}, candidate: {
  skills: string[];
  experienceYears: number;
  profileSummary: string;
}): Promise<EvaluationResult> {
  console.info("[AI Evaluation] Gemini request started");
  const prompt = buildEvaluationPrompt(job, candidate);

  try {
    const response = await Promise.race([
      gemini.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 800,
        },
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Gemini evaluation timed out")), TIMEOUT_MS);
      }),
    ]);

    console.info("[AI Evaluation] Gemini response received");
    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned no content.");
    }

    const cleanedText = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedText);
    console.info("[AI Evaluation] JSON parsed");
    return normalizeRecord(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[AI Evaluation] Gemini failure", {
      name,
      message,
    });
    throw error;
  }
}
