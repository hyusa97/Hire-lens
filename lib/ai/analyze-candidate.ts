import "server-only";
import { gemini } from "./client";
import { buildEvaluationPrompt } from "./prompts";
import { evaluationSchema, type EvaluationResult } from "./schema";
import { parseJsonResponse } from "./parse-json-response";

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

async function requestEvaluation(
  prompt: string,
): Promise<EvaluationResult> {
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
      setTimeout(
        () => reject(new Error("Gemini evaluation timed out")),
        TIMEOUT_MS,
      );
    }),
  ]);

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned no content.");
  }

  const parsed = parseJsonResponse(text);

  return normalizeRecord(parsed);
}

export async function analyzeCandidateWithGemini(
  job: {
    title: string;
    department: string | null;
    description: string | null;
    requirements: string | null;
    requiredSkills: string[] | null;
    experienceLevel: string | null;
  },
  candidate: {
    skills: string[];
    experienceYears: number;
    profileSummary: string;
  },
): Promise<EvaluationResult> {
  const prompt = buildEvaluationPrompt(job, candidate);

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    console.info("[AI Evaluation] Gemini request started", {
      attempt,
    });

    try {
      const result = await requestEvaluation(prompt);

      console.info("[AI Evaluation] response validated", {
        attempt,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown Gemini error";

      const name =
        error instanceof Error
          ? error.name
          : "UnknownError";

      console.error("[AI Evaluation] attempt failed", {
        attempt,
        name,
        message,
      });

      if (attempt === 2) {
        console.error(
          "[AI Evaluation] Gemini failure after retry",
          {
            name,
            message,
          },
        );

        throw error;
      }

      console.info(
        "[AI Evaluation] retrying after invalid response",
      );
    }
  }

  throw new Error("Gemini evaluation failed unexpectedly.");
}
