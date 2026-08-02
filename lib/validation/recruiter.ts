import { z } from "zod";

export const hiringTypes = [
  "company",
  "startup",
  "agency",
  "freelancer",
  "government",
  "university",
  "consultancy",
  "ngo",
] as const;

export const recruiterProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(100),

  headline: z.string().trim().max(120),

  about: z.string().trim().max(1000),

  hiringType: z.enum(hiringTypes),

  companyName: z.string().trim().max(120),

  companyWebsite: z
    .string()
    .trim()
    .url()
    .or(z.literal("")),

  companyLinkedin: z
    .string()
    .trim()
    .url()
    .or(z.literal("")),

  recruiterLinkedin: z
    .string()
    .trim()
    .url()
    .or(z.literal("")),

  professionalEmail: z
    .string()
    .trim()
    .email()
    .or(z.literal("")),

  location: z.string().trim().max(120),

  showEmail: z.boolean(),

  showLinkedin: z.boolean(),

  allowDirectContact: z.boolean(),
});

export type RecruiterProfileValues =
  z.infer<typeof recruiterProfileSchema>;