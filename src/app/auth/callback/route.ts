import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirectUrl(nextPath: string, origin: string) {
  const redirectUrl = new URL(nextPath, origin);

  return redirectUrl.origin === origin ? redirectUrl : new URL("/", origin);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;
  const nextPath = requestUrl.searchParams.get("next") ?? "/";
  const redirectUrl = getSafeRedirectUrl(nextPath, origin);

  redirectUrl.searchParams.set("auth", "profile");

  if (authError) {
    redirectUrl.searchParams.set("auth_error", authError);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set("auth_error", "The sign-in provider did not return an auth code.");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  } catch (error) {
    redirectUrl.searchParams.set("auth_error", error instanceof Error ? error.message : "The sign-in callback could not be completed.");
  }

  return NextResponse.redirect(redirectUrl);
}
