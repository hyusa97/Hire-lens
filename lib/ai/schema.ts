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

const evidenceListSchema = z.array(z.string().trim().min(1)).default([]);

export const resumeSkillSchema = z.object({
  name: z.string().trim().min(1),
  evidence: evidenceListSchema,
});

export const resumeExperienceSchema = z.object({
  company: z.string().trim().min(1),
  role: z.string().trim().min(1),
  startDate: z.union([z.string().trim().min(1), z.null()]),
  endDate: z.union([z.string().trim().min(1), z.null()]),
  description: z.string().trim().min(1),
  skills: z.array(z.string().trim().min(1)).default([]),
});

export const resumeProjectSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  technologies: z.array(z.string().trim().min(1)).default([]),
  evidence: evidenceListSchema,
});

export const resumeEducationSchema = z.object({
  institution: z.string().trim().min(1),
  degree: z.string().trim().min(1),
  field: z.union([z.string().trim().min(1), z.null()]),
  startDate: z.union([z.string().trim().min(1), z.null()]),
  endDate: z.union([z.string().trim().min(1), z.null()]),
});

export const resumeCertificationSchema = z.object({
  name: z.string().trim().min(1),
  issuer: z.union([z.string().trim().min(1), z.null()]),
});

export const resumeIntelligenceSchema = z.object({
  professionalSummary: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return null;
      }

      return value;
    },
    z.string().trim().min(1).nullable(),
  ),
  skills: z.array(resumeSkillSchema).default([]),
  experience: z.array(resumeExperienceSchema).default([]),
  projects: z.array(resumeProjectSchema).default([]),
  education: z.array(resumeEducationSchema).default([]),
  certifications: z.array(resumeCertificationSchema).default([]),
  
});

export type ResumeIntelligenceResult = z.infer<typeof resumeIntelligenceSchema>;
