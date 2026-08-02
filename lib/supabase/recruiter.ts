"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuthServerClient } from "./auth-server";
import { supabaseServer } from "./server-client";

import {
  recruiterProfileSchema,
  type RecruiterProfileValues,
} from "../validation/recruiter";

import { type RecruiterProfileState } from "./recruiter-state";

async function generateUniqueSlug(displayName: string) {
  const baseSlug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabaseServer
      .from("recruiter_profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to validate recruiter slug: ${error.message}`,
      );
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function getRecruiterProfile() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabaseServer
    .from("recruiter_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load recruiter profile: ${error.message}`,
    );
  }

  return data;
}

export async function getRecruiterProfileBySlug(
  slug: string,
) {
  const { data, error } = await supabaseServer
    .from("recruiter_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load recruiter profile: ${error.message}`,
    );
  }

  return data;

}
export async function createRecruiterProfile(
  prevState: RecruiterProfileState,
  formData: FormData,
): Promise<RecruiterProfileState> {
  const values: RecruiterProfileValues = {
    displayName: formData.get("displayName")?.toString() ?? "",
    headline: formData.get("headline")?.toString() ?? "",
    about: formData.get("about")?.toString() ?? "",

    hiringType:
      (formData.get("hiringType") as RecruiterProfileValues["hiringType"]) ??
      "company",

    companyName: formData.get("companyName")?.toString() ?? "",
    companyWebsite: formData.get("companyWebsite")?.toString() ?? "",
    companyLinkedin: formData.get("companyLinkedin")?.toString() ?? "",

    recruiterLinkedin:
      formData.get("recruiterLinkedin")?.toString() ?? "",

    professionalEmail:
      formData.get("professionalEmail")?.toString() ?? "",

    location: formData.get("location")?.toString() ?? "",

    showEmail: formData.get("showEmail") === "on",
    showLinkedin: formData.get("showLinkedin") === "on",
    allowDirectContact:
      formData.get("allowDirectContact") === "on",
  };

  const parsed = recruiterProfileSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Please correct the highlighted fields and try again.",
      errors: {
        displayName: fieldErrors.displayName?.[0],
        headline: fieldErrors.headline?.[0],
        about: fieldErrors.about?.[0],
        hiringType: fieldErrors.hiringType?.[0],
        companyName: fieldErrors.companyName?.[0],
        companyWebsite: fieldErrors.companyWebsite?.[0],
        companyLinkedin: fieldErrors.companyLinkedin?.[0],
        recruiterLinkedin: fieldErrors.recruiterLinkedin?.[0],
        professionalEmail: fieldErrors.professionalEmail?.[0],
        location: fieldErrors.location?.[0],
      },
      values,
    };
  }

  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const slug = await generateUniqueSlug(parsed.data.displayName);

  const { error } = await supabaseServer
    .from("recruiter_profiles")
    .insert({
      user_id: user.id,
      slug,
      display_name: parsed.data.displayName,
      headline: parsed.data.headline,
      about: parsed.data.about,
      hiring_type: parsed.data.hiringType,
      company_name: parsed.data.companyName,
      company_website: parsed.data.companyWebsite,
      company_linkedin: parsed.data.companyLinkedin,
      recruiter_linkedin: parsed.data.recruiterLinkedin,
      professional_email: parsed.data.professionalEmail,
      location: parsed.data.location,
      show_email: parsed.data.showEmail,
      show_linkedin: parsed.data.showLinkedin,
      allow_direct_contact: parsed.data.allowDirectContact,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
      errors: {},
      values: parsed.data,
    };
  }

  revalidatePath("/recruiter");
  revalidatePath("/recruiter/profile");

  redirect("/recruiter/profile");
}

export async function updateRecruiterProfile(
  prevState: RecruiterProfileState,
  formData: FormData,
): Promise<RecruiterProfileState> {
  const values: RecruiterProfileValues = {
    displayName: formData.get("displayName")?.toString() ?? "",
    headline: formData.get("headline")?.toString() ?? "",
    about: formData.get("about")?.toString() ?? "",

    hiringType:
      (formData.get("hiringType") as RecruiterProfileValues["hiringType"]) ??
      "company",

    companyName: formData.get("companyName")?.toString() ?? "",
    companyWebsite: formData.get("companyWebsite")?.toString() ?? "",
    companyLinkedin: formData.get("companyLinkedin")?.toString() ?? "",

    recruiterLinkedin:
      formData.get("recruiterLinkedin")?.toString() ?? "",

    professionalEmail:
      formData.get("professionalEmail")?.toString() ?? "",

    location: formData.get("location")?.toString() ?? "",

    showEmail: formData.get("showEmail") === "on",
    showLinkedin: formData.get("showLinkedin") === "on",
    allowDirectContact:
      formData.get("allowDirectContact") === "on",
  };

  const parsed = recruiterProfileSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Please correct the highlighted fields and try again.",
      errors: {
        displayName: fieldErrors.displayName?.[0],
        headline: fieldErrors.headline?.[0],
        about: fieldErrors.about?.[0],
        hiringType: fieldErrors.hiringType?.[0],
        companyName: fieldErrors.companyName?.[0],
        companyWebsite: fieldErrors.companyWebsite?.[0],
        companyLinkedin: fieldErrors.companyLinkedin?.[0],
        recruiterLinkedin: fieldErrors.recruiterLinkedin?.[0],
        professionalEmail: fieldErrors.professionalEmail?.[0],
        location: fieldErrors.location?.[0],
      },
      values,
    };
  }

  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabaseServer
    .from("recruiter_profiles")
    .update({
      display_name: parsed.data.displayName,
      headline: parsed.data.headline,
      about: parsed.data.about,
      hiring_type: parsed.data.hiringType,
      company_name: parsed.data.companyName,
      company_website: parsed.data.companyWebsite,
      company_linkedin: parsed.data.companyLinkedin,
      recruiter_linkedin: parsed.data.recruiterLinkedin,
      professional_email: parsed.data.professionalEmail,
      location: parsed.data.location,
      show_email: parsed.data.showEmail,
      show_linkedin: parsed.data.showLinkedin,
      allow_direct_contact: parsed.data.allowDirectContact,
    })
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message,
      errors: {},
      values: parsed.data,
    };
  }

  revalidatePath("/recruiter");
  revalidatePath("/recruiter/profile");

  redirect("/recruiter/profile");
}
