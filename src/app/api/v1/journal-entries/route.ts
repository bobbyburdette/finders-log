import { NextResponse } from "next/server";
import { jsonError, requireSupabaseUser } from "@/lib/server/api-helpers";
import {
  mapEntryToJournalEntryRow,
  mapJournalEntryRowToEntry,
  type JournalEntryRecord
} from "@/lib/server/journal-entry-records";

export async function GET() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("journal_entry")
    .select(
      "id, category, title, entry_date, time_of_day, location, quick_notes, is_favorite, suggested_score, overall_thoughts, created_at, catalog_refs, detail"
    )
    .eq("user_id", auth.userId)
    .in("category", ["pipe", "cigar", "spirits"])
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("Failed to load journal entries from Supabase.", 500, { detail: error.message });
  }

  return NextResponse.json({
    entries: (data ?? []).map((row) => mapJournalEntryRowToEntry(row as never))
  });
}

export async function PUT(request: Request) {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { entries?: JournalEntryRecord[] } | null;
  const entries = Array.isArray(body?.entries) ? body.entries : null;

  if (!entries) {
    return jsonError("Journal entries payload must include an entries array.", 400);
  }

  const incomingIds = entries.map((entry) => entry.id);

  const { data: existingRows, error: existingError } = await auth.supabase
    .from("journal_entry")
    .select("id")
    .eq("user_id", auth.userId)
    .in("category", ["pipe", "cigar", "spirits"]);

  if (existingError) {
    return jsonError("Failed to inspect existing journal entries.", 500, { detail: existingError.message });
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
      return jsonError("Failed to remove old journal entries.", 500, { detail: deleteError.message });
    }
  }

  if (entries.length) {
    const payload = entries.map((entry) => mapEntryToJournalEntryRow(auth.userId, entry));
    const { error: upsertError } = await auth.supabase.from("journal_entry").upsert(payload, { onConflict: "id" });

    if (upsertError) {
      return jsonError("Failed to save journal entries to Supabase.", 500, { detail: upsertError.message });
    }
  }

  return NextResponse.json({ entries });
}
