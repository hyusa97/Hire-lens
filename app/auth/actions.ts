"use server";

import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  const supabase = await createAuthServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

if (error) {
  if (error.code === "email_not_confirmed") {
    redirect(
      "/login?error=Please%20verify%20your%20email%20before%20signing%20in.%20Check%20your%20inbox%20for%20the%20verification%20link.",
    );
  }

  redirect("/login?error=Invalid%20email%20or%20password");
}

  redirect("/recruiter");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/signup?error=Email%20and%20password%20are%20required");
  }

  if (password.length < 8) {
    redirect("/signup?error=Password%20must%20be%20at%20least%208%20characters");
  }

  const supabase = await createAuthServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

if (error) {
  if (error.message.toLowerCase().includes("email rate limit exceeded")) {
    redirect(
      `/verify-email?status=already-sent&email=${encodeURIComponent(email)}`,
    );
  }

  redirect(`/signup?error=${encodeURIComponent(error.message)}`);
}

redirect(
  `/verify-email?status=sent&email=${encodeURIComponent(email)}`,
);
}

export async function logout() {
  const supabase = await createAuthServerClient();

  await supabase.auth.signOut();

  redirect("/");
}