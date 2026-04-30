import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseUserContext } from "@/lib/supabase/auth";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      error: message,
      ...extra
    },
    { status }
  );
}

export async function requireSupabaseUser() {
  const context = await getSupabaseUserContext();

  if (!context.configured) {
    return {
      ok: false as const,
      response: jsonError("Supabase is not configured locally yet.", 503, {
        status: "missing_supabase_config"
      })
    };
  }

  if (!context.userId) {
    return {
      ok: false as const,
      response: jsonError("Please sign in before using the cloud-backed API.", 401, {
        status: "auth_required"
      })
    };
  }

  return {
    ok: true as const,
    userId: context.userId,
    email: context.email,
    supabase: await createClient()
  };
}
