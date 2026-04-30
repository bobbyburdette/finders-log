import type { PipeDraftState, PipeEntry } from "@/lib/pipe-journal";

type JournalEntryRow = {
  id: string;
  category: "pipe";
  title: string;
  entry_date: string | null;
  time_of_day: string | null;
  location: string | null;
  quick_notes: string | null;
  suggested_score: number | null;
  created_at: string;
  catalog_refs: Record<string, unknown> | null;
  detail: Record<string, unknown> | null;
};

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

export function mapJournalEntryRowToPipeEntry(row: JournalEntryRow): PipeEntry {
  const detail = row.detail ?? {};
  const catalogRefs = row.catalog_refs ?? {};
  const ratings =
    detail.ratings && typeof detail.ratings === "object"
      ? (detail.ratings as Record<string, unknown>)
      : {};

  return {
    id: row.id,
    category: "pipe",
    brandId: typeof catalogRefs.brandId === "string" ? catalogRefs.brandId : null,
    blendId: typeof catalogRefs.blendId === "string" ? catalogRefs.blendId : null,
    pipeItemId: typeof catalogRefs.pipeItemId === "string" ? catalogRefs.pipeItemId : null,
    catalogSource:
      catalogRefs.catalogSource === "seed" || catalogRefs.catalogSource === "user" || catalogRefs.catalogSource === "manual"
        ? catalogRefs.catalogSource
        : "manual",
    brand: readString(detail.brand),
    blendName: row.title,
    date: row.entry_date ?? "",
    timeOfDay: row.time_of_day ?? "",
    setting: readString(detail.setting),
    location: row.location ?? "",
    pipeUsed: readString(detail.pipeUsed),
    lighterUsed: readString(detail.lighterUsed),
    blendType: readString(detail.blendType),
    cutType: readString(detail.cutType),
    nicotineStrength: readString(detail.nicotineStrength),
    components: readStringArray(detail.components),
    quickNotes: row.quick_notes ?? "",
    firstThirdNotes: readString(detail.firstThirdNotes),
    middleThirdNotes: readString(detail.middleThirdNotes),
    finalThirdNotes: readString(detail.finalThirdNotes),
    tinNotes: readString(detail.tinNotes),
    yearBlended: readString(detail.yearBlended),
    prepNotes: readString(detail.prepNotes),
    isFavorite: Boolean(detail.isFavorite),
    ratings: {
      flavor: readNumber(ratings.flavor),
      strength: readNumber(ratings.strength),
      roomNote: readNumber(ratings.roomNote),
      performance: readNumber(ratings.performance),
      enjoyment: readNumber(ratings.enjoyment),
      tin: readNumber(ratings.tin),
      mechanics: readNumber(ratings.mechanics)
    },
    suggestedScore: row.suggested_score ?? 0,
    createdAt: row.created_at
  };
}

export function mapPipeEntryToJournalEntryRow(userId: string, entry: PipeEntry) {
  return {
    id: entry.id,
    user_id: userId,
    category: "pipe",
    title: entry.blendName,
    entry_date: entry.date || null,
    time_of_day: entry.timeOfDay || null,
    location: entry.location || null,
    quick_notes: entry.quickNotes || null,
    suggested_score: entry.suggestedScore,
    final_score: null,
    use_final_override: false,
    overall_thoughts: null,
    catalog_refs: {
      brandId: entry.brandId,
      blendId: entry.blendId,
      pipeItemId: entry.pipeItemId ?? null,
      catalogSource: entry.catalogSource
    },
    detail: {
      brand: entry.brand,
      setting: entry.setting,
      pipeUsed: entry.pipeUsed,
      lighterUsed: entry.lighterUsed,
      blendType: entry.blendType,
      cutType: entry.cutType,
      nicotineStrength: entry.nicotineStrength,
      components: entry.components,
      firstThirdNotes: entry.firstThirdNotes,
      middleThirdNotes: entry.middleThirdNotes,
      finalThirdNotes: entry.finalThirdNotes,
      tinNotes: entry.tinNotes,
      yearBlended: entry.yearBlended,
      prepNotes: entry.prepNotes,
      isFavorite: entry.isFavorite,
      ratings: entry.ratings
    }
  };
}

export function normalizePipeDraftPayload(payload: unknown): PipeDraftState | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as PipeDraftState;
}
