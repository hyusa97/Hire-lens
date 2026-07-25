import { z } from "zod";

export type CreateJobValues = {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  requiredSkills: string;
  description: string;
  requirements: string;
  status: "active" | "closed" | "draft";
};

export const createJobSchema = z.object({
  title: z.string().trim().min(3, "Please provide a clear role title."),
  department: z.string().trim().max(80, "Please keep the department concise.").optional().or(z.literal("")),
  location: z.string().trim().max(120, "Please keep the location concise.").optional().or(z.literal("")),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]),
  requiredSkills: z.string().trim().min(1, "Please enter at least one required skill."),
  description: z.string().trim().min(20, "Please describe the role in enough detail."),
  requirements: z.string().trim().min(20, "Please outline the role requirements."),
  status: z.enum(["active", "closed", "draft"]),
});

export function normalizeSkills(rawSkills: string) {
  return rawSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}
