import type { CigarEntry, CigarRatings } from "@/lib/cigar-journal";
import type { PipeEntry, PipeRatings } from "@/lib/pipe-journal";
import type { SpiritEntry } from "@/lib/spirit-journal";

export type JournalEntryRecord = PipeEntry | CigarEntry | SpiritEntry;

type JournalEntryRow = {
  id: string;
  category: "pipe" | "cigar" | "spirits";
  title: string;
  entry_date: string | null;
  time_of_day: string | null;
  location: string | null;
  quick_notes: string | null;
  is_favorite: boolean | null;
  suggested_score: number | null;
  overall_thoughts: string | null;
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

function readEntryMode(value: unknown) {
  return value === "full" || value === "quick" ? value : undefined;
}

function readCatalogSource(value: unknown) {
  return value === "seed" || value === "user" || value === "manual" ? value : "manual";
}

function readFavorite(row: JournalEntryRow, detail: Record<string, unknown>) {
  return row.is_favorite ?? Boolean(detail.isFavorite);
}

function readRatings<T extends Record<string, number>>(value: unknown, defaults: T): T {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, readNumber(source[key])])
  ) as T;
}

function mapJournalEntryRowToPipeEntry(row: JournalEntryRow): PipeEntry {
  const detail = row.detail ?? {};
  const catalogRefs = row.catalog_refs ?? {};

  return {
    id: row.id,
    category: "pipe",
    entryMode: readEntryMode(detail.entryMode),
    brandId: typeof catalogRefs.brandId === "string" ? catalogRefs.brandId : null,
    blendId: typeof catalogRefs.blendId === "string" ? catalogRefs.blendId : null,
    pipeItemId: typeof catalogRefs.pipeItemId === "string" ? catalogRefs.pipeItemId : null,
    catalogSource: readCatalogSource(catalogRefs.catalogSource),
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
    isFavorite: readFavorite(row, detail),
    ratings: readRatings<PipeRatings>(detail.ratings, {
      flavor: 0,
      strength: 0,
      roomNote: 0,
      performance: 0,
      enjoyment: 0,
      tin: 0,
      mechanics: 0
    }),
    suggestedScore: row.suggested_score ?? 0,
    createdAt: row.created_at
  };
}

function mapJournalEntryRowToCigarEntry(row: JournalEntryRow): CigarEntry {
  const detail = row.detail ?? {};
  const catalogRefs = row.catalog_refs ?? {};

  return {
    id: row.id,
    category: "cigar",
    entryMode: readEntryMode(detail.entryMode),
    brandId: typeof catalogRefs.brandId === "string" ? catalogRefs.brandId : null,
    cigarItemId: typeof catalogRefs.cigarItemId === "string" ? catalogRefs.cigarItemId : null,
    catalogSource: readCatalogSource(catalogRefs.catalogSource),
    brand: readString(detail.brand),
    lineName: row.title,
    date: row.entry_date ?? "",
    purchaseDate: readString(detail.purchaseDate),
    boughtFrom: readString(detail.boughtFrom),
    price: readString(detail.price),
    restTime: readString(detail.restTime),
    timeOfDay: row.time_of_day ?? "",
    setting: readString(detail.setting),
    location: row.location ?? "",
    vitola: readString(detail.vitola),
    cutType: readString(detail.cutType),
    countryFactory: readString(detail.countryFactory),
    wrapper: readString(detail.wrapper),
    binder: readString(detail.binder),
    filler: readString(detail.filler),
    strengthBand: readString(detail.strengthBand),
    flavorNotes: readStringArray(detail.flavorNotes),
    quickNotes: row.quick_notes ?? "",
    firstThirdNotes: readString(detail.firstThirdNotes),
    middleThirdNotes: readString(detail.middleThirdNotes),
    finalThirdNotes: readString(detail.finalThirdNotes),
    pairing: readString(detail.pairing),
    buyAgain: readString(detail.buyAgain),
    isFavorite: readFavorite(row, detail),
    ratings: readRatings<CigarRatings>(detail.ratings, {
      flavor: 0,
      construction: 0,
      draw: 0,
      burn: 0,
      aroma: 0,
      strength: 0,
      enjoyment: 0
    }),
    suggestedScore: row.suggested_score ?? 0,
    createdAt: row.created_at
  };
}

function mapJournalEntryRowToSpiritEntry(row: JournalEntryRow): SpiritEntry {
  const detail = row.detail ?? {};
  const catalogRefs = row.catalog_refs ?? {};

  return {
    id: row.id,
    category: "spirits",
    entryMode: readEntryMode(detail.entryMode),
    brandId: typeof catalogRefs.brandId === "string" ? catalogRefs.brandId : null,
    spiritItemId: typeof catalogRefs.spiritItemId === "string" ? catalogRefs.spiritItemId : null,
    catalogSource: readCatalogSource(catalogRefs.catalogSource),
    name: row.title,
    brand: readString(detail.brand),
    date: row.entry_date ?? "",
    timeOfDay: row.time_of_day ?? "",
    spiritType: readString(detail.spiritType),
    ageStatement: readString(detail.ageStatement),
    proof: readString(detail.proof),
    mashbill: readString(detail.mashbill),
    barrelTypeFinish: readString(detail.barrelTypeFinish),
    batchBarrelNumber: readString(detail.batchBarrelNumber),
    color: readString(detail.color),
    clarity: readString(detail.clarity),
    legs: readString(detail.legs),
    beading: readString(detail.beading),
    glass: readString(detail.glass),
    aromaComplexity: readString(detail.aromaComplexity),
    aromaNotes: readString(detail.aromaNotes),
    palateSweetness: readString(detail.palateSweetness),
    palateTexture: readString(detail.palateTexture),
    palateBody: readString(detail.palateBody),
    palateNotes: readString(detail.palateNotes),
    flavorNotes: readStringArray(detail.flavorNotes),
    finishLength: readString(detail.finishLength),
    finishNotes: readString(detail.finishNotes),
    pricePaid: readString(detail.pricePaid),
    drinkStyle: readString(detail.drinkStyle),
    overallImpression: row.overall_thoughts ?? readString(detail.overallImpression),
    buyAgain: readString(detail.buyAgain),
    quickTags: readStringArray(detail.quickTags),
    isFavorite: readFavorite(row, detail),
    rating: readNumber(detail.rating),
    suggestedScore: row.suggested_score ?? 0,
    createdAt: row.created_at
  };
}

export function mapJournalEntryRowToEntry(row: JournalEntryRow): JournalEntryRecord {
  if (row.category === "cigar") return mapJournalEntryRowToCigarEntry(row);
  if (row.category === "spirits") return mapJournalEntryRowToSpiritEntry(row);
  return mapJournalEntryRowToPipeEntry(row);
}

export function mapEntryToJournalEntryRow(userId: string, entry: JournalEntryRecord) {
  const base = {
    id: entry.id,
    user_id: userId,
    category: entry.category,
    entry_date: entry.date || null,
    time_of_day: entry.timeOfDay || null,
    location: "location" in entry ? entry.location || null : null,
    tags: [],
    is_favorite: entry.isFavorite,
    suggested_score: entry.suggestedScore,
    final_score: null,
    use_final_override: false,
    quick_notes: "quickNotes" in entry ? entry.quickNotes || null : null,
    created_at: entry.createdAt,
    updated_at: new Date().toISOString()
  };

  if (entry.category === "cigar") {
    return {
      ...base,
      title: entry.lineName,
      overall_thoughts: null,
      catalog_refs: {
        brandId: entry.brandId,
        cigarItemId: entry.cigarItemId,
        catalogSource: entry.catalogSource
      },
      detail: {
        entryMode: entry.entryMode,
        brand: entry.brand,
        purchaseDate: entry.purchaseDate,
        boughtFrom: entry.boughtFrom,
        price: entry.price,
        restTime: entry.restTime,
        setting: entry.setting,
        vitola: entry.vitola,
        cutType: entry.cutType,
        countryFactory: entry.countryFactory,
        wrapper: entry.wrapper,
        binder: entry.binder,
        filler: entry.filler,
        strengthBand: entry.strengthBand,
        flavorNotes: entry.flavorNotes,
        firstThirdNotes: entry.firstThirdNotes,
        middleThirdNotes: entry.middleThirdNotes,
        finalThirdNotes: entry.finalThirdNotes,
        pairing: entry.pairing,
        buyAgain: entry.buyAgain,
        isFavorite: entry.isFavorite,
        ratings: entry.ratings
      }
    };
  }

  if (entry.category === "spirits") {
    return {
      ...base,
      title: entry.name,
      overall_thoughts: entry.overallImpression || null,
      catalog_refs: {
        brandId: entry.brandId,
        spiritItemId: entry.spiritItemId,
        catalogSource: entry.catalogSource
      },
      detail: {
        entryMode: entry.entryMode,
        brand: entry.brand,
        spiritType: entry.spiritType,
        ageStatement: entry.ageStatement,
        proof: entry.proof,
        mashbill: entry.mashbill,
        barrelTypeFinish: entry.barrelTypeFinish,
        batchBarrelNumber: entry.batchBarrelNumber,
        color: entry.color,
        clarity: entry.clarity,
        legs: entry.legs,
        beading: entry.beading,
        glass: entry.glass,
        aromaComplexity: entry.aromaComplexity,
        aromaNotes: entry.aromaNotes,
        palateSweetness: entry.palateSweetness,
        palateTexture: entry.palateTexture,
        palateBody: entry.palateBody,
        palateNotes: entry.palateNotes,
        flavorNotes: entry.flavorNotes,
        finishLength: entry.finishLength,
        finishNotes: entry.finishNotes,
        pricePaid: entry.pricePaid,
        drinkStyle: entry.drinkStyle,
        overallImpression: entry.overallImpression,
        buyAgain: entry.buyAgain,
        quickTags: entry.quickTags,
        isFavorite: entry.isFavorite,
        rating: entry.rating
      }
    };
  }

  return {
    ...base,
    title: entry.blendName,
    overall_thoughts: null,
    catalog_refs: {
      brandId: entry.brandId,
      blendId: entry.blendId,
      pipeItemId: entry.pipeItemId ?? null,
      catalogSource: entry.catalogSource
    },
    detail: {
      entryMode: entry.entryMode,
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
