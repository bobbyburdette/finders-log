import { NextResponse } from "next/server";
import { backendConfig } from "@/lib/backend-config";
import { getSupabaseUserContext } from "@/lib/supabase/auth";

export async function GET() {
  let configured = false;
  let userId: string | null = null;
  let email: string | null = null;

  try {
    const context = await getSupabaseUserContext();
    configured = context.configured;
    userId = context.userId;
    email = context.email;
  } catch (error) {
    return NextResponse.json({
      provider: backendConfig.currentDataProvider,
      status: "misconfigured",
      configured,
      message: "Supabase mode is enabled, but the server client could not initialize.",
      error: error instanceof Error ? error.message : "Unknown Supabase error"
    });
  }

  return NextResponse.json({
    provider: backendConfig.currentDataProvider,
    status:
      backendConfig.currentDataProvider === "supabase"
        ? configured
          ? userId
            ? "connected"
            : "configured"
          : "pending"
        : "browser-only",
    configured,
    userId,
    email,
    message:
      backendConfig.currentDataProvider === "supabase"
        ? configured
          ? userId
            ? "Supabase is configured and an authenticated user is available."
            : "Supabase is configured. Auth can be connected next."
          : "Supabase mode is selected, but environment keys have not been configured yet."
        : "The app is currently using browser-backed services."
  });
}
