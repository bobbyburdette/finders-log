import { NextResponse } from "next/server";
import { jsonError, requireSupabaseUser } from "@/lib/server/api-helpers";
import {
  mapEntryToJournalEntryRow,
  mapJournalEntryRowToEntry,
  type JournalEntryRecord
} from "@/lib/server/journal-entry-records";

type JournalEntryRowWithDelete = {
  id: string;
  detail: Record<string, unknown> | null;
};

function getDeletedAt(row: JournalEntryRowWithDelete) {
  const detail = row.detail && typeof row.detail === "object" && !Array.isArray(row.detail) ? row.detail : {};
  return typeof detail.deletedAt === "string" ? detail.deletedAt : null;
}

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

  const rows = (data ?? []) as JournalEntryRowWithDelete[];
  const activeRows = rows.filter((row) => !getDeletedAt(row));
  const deletedEntryIds = rows.filter((row) => getDeletedAt(row)).map((row) => row.id);

  return NextResponse.json({
    entries: activeRows.map((row) => mapJournalEntryRowToEntry(row as never)),
    deletedEntryIds
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

  const entryIds = entries.map((entry) => entry.id);
  const tombstonedIds = new Set<string>();

  if (entryIds.length) {
    const { data: existingRows, error: tombstoneError } = await auth.supabase
      .from("journal_entry")
      .select("id, detail")
      .eq("user_id", auth.userId)
      .in("id", entryIds);

    if (tombstoneError) {
      return jsonError("Failed to verify saved journal entries.", 500, { detail: tombstoneError.message });
    }

    for (const row of (existingRows ?? []) as JournalEntryRowWithDelete[]) {
      if (getDeletedAt(row)) {
        tombstonedIds.add(row.id);
      }
    }
  }

  const activeEntries = entries.filter((entry) => !tombstonedIds.has(entry.id));

  if (activeEntries.length) {
    const payload = activeEntries.map((entry) => mapEntryToJournalEntryRow(auth.userId, entry));
    const { error: upsertError } = await auth.supabase.from("journal_entry").upsert(payload, { onConflict: "id" });

    if (upsertError) {
      return jsonError("Failed to save journal entries to Supabase.", 500, { detail: upsertError.message });
    }
  }

  return NextResponse.json({ entries: activeEntries });
}

export async function DELETE(request: Request) {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const entryId = typeof body?.id === "string" ? body.id : null;

  if (!entryId) {
    return jsonError("Journal entry delete request must include an entry id.", 400);
  }

  const { data: existingRow, error: selectError } = await auth.supabase
    .from("journal_entry")
    .select("id, detail")
    .eq("user_id", auth.userId)
    .eq("id", entryId)
    .maybeSingle();

  if (selectError) {
    return jsonError("Failed to find that journal entry.", 500, { detail: selectError.message });
  }

  if (!existingRow) {
    return NextResponse.json({ id: entryId });
  }

  const existingDetail =
    existingRow.detail && typeof existingRow.detail === "object" && !Array.isArray(existingRow.detail)
      ? (existingRow.detail as Record<string, unknown>)
      : {};
  const deletedAt = new Date().toISOString();

  const { error: updateError } = await auth.supabase
    .from("journal_entry")
    .update({
      detail: {
        ...existingDetail,
        deletedAt
      },
      updated_at: deletedAt
    })
    .eq("user_id", auth.userId)
    .eq("id", entryId);

  if (updateError) {
    return jsonError("Failed to delete that journal entry.", 500, { detail: updateError.message });
  }

  return NextResponse.json({ id: entryId, deletedAt });
}
