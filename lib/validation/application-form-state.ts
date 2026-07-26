import type { ApplicationFormValues } from "./applications";

export type ApplicationFormState = {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof ApplicationFormValues, string>>;
  values: ApplicationFormValues;
};