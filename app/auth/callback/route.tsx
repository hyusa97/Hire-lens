import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid%20verification%20link", requestUrl.origin),
    );
  }

  const supabase = await createAuthServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/login?error=Unable%20to%20verify%20your%20email",
        requestUrl.origin,
      ),
    );
  }

  return NextResponse.redirect(
    new URL(
      "/login?message=Email%20verified.%20You%20can%20now%20sign%20in.",
      requestUrl.origin,
    ),
  );
}