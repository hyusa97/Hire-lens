import "server-only";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

export const gemini = new GoogleGenAI({ apiKey: geminiApiKey });
