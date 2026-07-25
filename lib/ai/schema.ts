import { z } from "zod";

export const evaluationSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchedSkills: z.array(z.string().trim().min(1)).default([]),
  missingSkills: z.array(z.string().trim().min(1)).default([]),
  strengths: z.array(z.string().trim().min(1)).default([]),
  concerns: z.array(z.string().trim().min(1)).default([]),
  summary: z.string().trim().min(1).max(500),
  recommendation: z.enum(["STRONG_MATCH", "GOOD_MATCH", "REVIEW", "WEAK_MATCH"]),
});

export type EvaluationResult = z.infer<typeof evaluationSchema>;
