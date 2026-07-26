import { z } from "zod";
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = ["application/pdf"];

export type ApplicationFormState = {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof ApplicationFormValues, string>>;
  values: ApplicationFormValues;
};

export type ApplicationFormValues = {
  name: string;
  email: string;
  phone: string;
  experienceYears: string;
  skills: string;
  profileSummary: string;
  githubUrl: string;
  portfolioUrl: string;
};

export const optionalUrlSchema = z.union([
  z.literal(""),
  z.string().trim().url("Please enter a valid URL."),
]);

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(30, "Please enter a shorter phone number."),
  experienceYears: z.coerce
    .number({ message: "Please enter a valid number of years." })
    .int({ message: "Please enter a whole number of years." })
    .nonnegative({ message: "Years of experience cannot be negative." })
    .max(60, { message: "Please enter a realistic number of years." }),
  skills: z
    .array(z.string().trim().min(1))
    .min(1, "Please enter at least one skill."),
  profileSummary: z
    .string()
    .trim()
    .min(20, "Please provide a meaningful professional summary."),
  githubUrl: optionalUrlSchema.transform((value) => (value === "" ? null : value)),
  portfolioUrl: optionalUrlSchema.transform((value) => (value === "" ? null : value)),
});

export function normalizeSkills(rawSkills: string) {
  return rawSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function parseApplicationValues(values: ApplicationFormValues) {
  return applicationSchema.safeParse({
    name: values.name,
    email: values.email.toLowerCase().trim(),
    phone: values.phone.trim(),
    experienceYears: values.experienceYears,
    skills: normalizeSkills(values.skills),
    profileSummary: values.profileSummary,
    githubUrl: values.githubUrl.trim(),
    portfolioUrl: values.portfolioUrl.trim(),
  });
}

export function validateResumeFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return {
      success: false as const,
      error: "Please upload your resume.",
    };
  }

  if (!ALLOWED_RESUME_TYPES.includes(value.type)) {
    return {
      success: false as const,
      error: "Resume must be a PDF file.",
    };
  }

  if (value.size > MAX_RESUME_SIZE) {
    return {
      success: false as const,
      error: "Resume must be 5 MB or smaller.",
    };
  }

  return {
    success: true as const,
    file: value,
  };
}