import { NextResponse } from "next/server";
import { jsonError, requireSupabaseUser } from "@/lib/server/api-helpers";
import { normalizePipeDraftPayload } from "@/lib/server/pipe-entry-records";
import type { PipeDraftState } from "@/lib/pipe-journal";

export async function GET() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("pipe_entry_draft")
    .select("payload")
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) {
    return jsonError("Failed to load the pipe draft from Supabase.", 500, { detail: error.message });
  }

  return NextResponse.json({
    draft: normalizePipeDraftPayload(data?.payload ?? null)
  });
}

export async function PUT(request: Request) {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { draft?: PipeDraftState } | null;
  if (!body?.draft) {
    return jsonError("Pipe draft payload must include a draft object.", 400);
  }

  const { error } = await auth.supabase
    .from("pipe_entry_draft")
    .upsert(
      {
        user_id: auth.userId,
        payload: body.draft
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return jsonError("Failed to save the pipe draft to Supabase.", 500, { detail: error.message });
  }

  return NextResponse.json({ draft: body.draft });
}

export async function DELETE() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const { error } = await auth.supabase.from("pipe_entry_draft").delete().eq("user_id", auth.userId);

  if (error) {
    return jsonError("Failed to clear the pipe draft from Supabase.", 500, { detail: error.message });
  }

  return NextResponse.json({ draft: null });
}
