import { NextResponse } from "next/server";
import { jsonError, requireSupabaseUser } from "@/lib/server/api-helpers";
import { mapJournalEntryRowToPipeEntry, mapPipeEntryToJournalEntryRow } from "@/lib/server/pipe-entry-records";
import type { PipeEntry } from "@/lib/pipe-journal";

export async function GET() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("journal_entry")
    .select("id, category, title, entry_date, time_of_day, location, quick_notes, suggested_score, created_at, catalog_refs, detail")
    .eq("user_id", auth.userId)
    .eq("category", "pipe")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("Failed to load pipe entries from Supabase.", 500, { detail: error.message });
  }

  return NextResponse.json({
    entries: (data ?? []).map((row) => mapJournalEntryRowToPipeEntry(row as never))
  });
}

export async function PUT(request: Request) {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { entries?: PipeEntry[] } | null;
  const entries = Array.isArray(body?.entries) ? body.entries : null;

  if (!entries) {
    return jsonError("Pipe entries payload must include an entries array.", 400);
  }

  const incomingIds = entries.map((entry) => entry.id);

  const { data: existingRows, error: existingError } = await auth.supabase
    .from("journal_entry")
    .select("id")
    .eq("user_id", auth.userId)
    .eq("category", "pipe");

  if (existingError) {
    return jsonError("Failed to inspect existing pipe entries.", 500, { detail: existingError.message });
  }

  const existingIds = (existingRows ?? []).map((row) => row.id as string);
  const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

  if (idsToDelete.length) {
    const { error: deleteError } = await auth.supabase
      .from("journal_entry")
      .delete()
      .eq("user_id", auth.userId)
      .in("id", idsToDelete);

    if (deleteError) {
      return jsonError("Failed to remove old pipe entries.", 500, { detail: deleteError.message });
    }
  }

  if (entries.length) {
    const payload = entries.map((entry) => mapPipeEntryToJournalEntryRow(auth.userId, entry));
    const { error: upsertError } = await auth.supabase
      .from("journal_entry")
      .upsert(payload, { onConflict: "id" });

    if (upsertError) {
      return jsonError("Failed to save pipe entries to Supabase.", 500, { detail: upsertError.message });
    }
  }

  return NextResponse.json({ entries });
}
