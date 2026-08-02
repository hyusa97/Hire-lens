import type { RecruiterProfileValues } from "../validation/recruiter";

export type RecruiterProfileState = {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof RecruiterProfileValues, string>>;
  values: RecruiterProfileValues;
};

export const initialRecruiterProfileValues: RecruiterProfileValues = {
  displayName: "",
  headline: "",
  about: "",

  hiringType: "company",

  companyName: "",
  companyWebsite: "",
  companyLinkedin: "",

  recruiterLinkedin: "",
  professionalEmail: "",

  location: "",

  showEmail: false,
  showLinkedin: true,
  allowDirectContact: false,
};

export const initialRecruiterProfileState: RecruiterProfileState = {
  success: false,
  message: "",
  errors: {},
  values: initialRecruiterProfileValues,
};