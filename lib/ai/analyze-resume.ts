import "server-only";
import { gemini } from "./client";
import {
  buildResumeIntelligencePrompt,
  buildResumeTextExtractionPrompt,
} from "./prompts";
import {
  resumeIntelligenceSchema,
  type ResumeIntelligenceResult,
} from "./schema";

const MODEL_NAME = "gemini-3.5-flash-lite";
const TIMEOUT_MS = 20_000;
const MAX_RESUME_TEXT_CHARS = 24_000;

function withTimeout<T>(promise: Promise<T>, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), TIMEOUT_MS);
    }),
  ]);
}

function cleanCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizeResumeIntelligence(value: unknown): ResumeIntelligenceResult {
  const parsed = resumeIntelligenceSchema.safeParse(value);
  if (!parsed.success) {
    console.error(
      "[Resume Intelligence] schema validation failed",
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
    })),
  );
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  return parsed.data;
}

function buildResumePdfContents(pdfBytes: Uint8Array, prompt: string) {
  return [
    {
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: Buffer.from(pdfBytes).toString("base64"),
          },
        },
      ],
    },
  ];
}

function normalizeResumeText(rawText: string) {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_RESUME_TEXT_CHARS);
}

export async function extractResumeTextFromPdfWithGemini(
  pdfBytes: Uint8Array,
): Promise<string> {
  console.info("[Resume Intelligence] PDF text extraction started");
  const response = await withTimeout(
    gemini.models.generateContent({
      model: MODEL_NAME,
      contents: buildResumePdfContents(pdfBytes, buildResumeTextExtractionPrompt()),
      config: {
        maxOutputTokens: 8000,
      },
    }),
    "Resume PDF extraction timed out",
  );

  const text = response.text;
  if (!text) {
    throw new Error("Resume PDF extraction returned no content.");
  }

  const normalizedText = normalizeResumeText(text);
  if (!normalizedText) {
    throw new Error("Resume PDF extraction returned empty text.");
  }

  console.info("[Resume Intelligence] PDF text extraction completed");
  return normalizedText;
}

export async function analyzeResumeIntelligenceFromTextWithGemini(
  normalizedResumeText: string,
): Promise<ResumeIntelligenceResult> {
  console.info("[Resume Intelligence] Structured extraction started");
  const prompt = buildResumeIntelligencePrompt(normalizedResumeText);

  const response = await withTimeout(
    gemini.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 5000,
      },
    }),
    "Resume intelligence extraction timed out",
  );

  const text = response.text;
  if (!text) {
    throw new Error("Resume intelligence extraction returned no content.");
  }

  const parsed = JSON.parse(cleanCodeFence(text));
  const normalized = normalizeResumeIntelligence(parsed);
  console.info("[Resume Intelligence] Structured extraction completed");
  return normalized;
}

export async function analyzeResumeFromPdfWithGemini(
  pdfBytes: Uint8Array,
): Promise<ResumeIntelligenceResult> {
  const normalizedResumeText = await extractResumeTextFromPdfWithGemini(pdfBytes);
  return analyzeResumeIntelligenceFromTextWithGemini(normalizedResumeText);
 
}
