import type { CatalogStore } from "@/lib/catalog";
import type { CigarEntry } from "@/lib/cigar-journal";
import type { JournalEntry } from "@/lib/home-shell/types";
import { cigarStrengthOptions } from "@/lib/home-shell/constants";
import { compareJournalEntriesByDate } from "@/lib/journal-entry-utils";
import type { EntryMode, PipeEntry, PipeFormState, PipeRatings } from "@/lib/pipe-journal";
import { getAuthCallbackUrl } from "@/lib/site-url";
import type { SpiritEntry } from "@/lib/spirit-journal";

export function createJournalEntryId() {
  return crypto.randomUUID();
}

export function createCollectionItemId() {
  return crypto.randomUUID();
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function ensureCloudSafeEntryIds<T extends JournalEntry>(entries: T[]) {
  return entries.map((entry) => (isUuid(entry.id) ? entry : { ...entry, id: createJournalEntryId() }));
}

export function ensureCloudSafeCollectionItemIds<T extends { id: string }>(items: T[]) {
  return items.map((item) => (isUuid(item.id) ? item : { ...item, id: createCollectionItemId() }));
}

export function haveSameIds<T extends { id: string }>(left: T[], right: T[]) {
  return left.length === right.length && left.every((item, index) => item.id === right[index]?.id);
}

export function mergeEntriesById<T extends JournalEntry>(remoteEntries: T[], localEntries: T[]) {
  const seenIds = new Set(remoteEntries.map((entry) => entry.id));

  return [...remoteEntries, ...localEntries.filter((entry) => !seenIds.has(entry.id))].sort(
    compareJournalEntriesByDate
  );
}

export function removeDeletedEntries<T extends JournalEntry>(entries: T[], deletedEntryIds: Set<string>) {
  if (!deletedEntryIds.size) return entries;
  return entries.filter((entry) => !deletedEntryIds.has(entry.id));
}

export function getProfileAuthRedirectUrl() {
  const fallbackOrigin = "http://localhost:3000";
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  return currentOrigin ? `${currentOrigin}/auth/callback` : getAuthCallbackUrl() || `${fallbackOrigin}/auth/callback`;
}

export function safeParseStored<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse stored Finders Log data", error);
    return fallback;
  }
}

export function toggleSingleChoice(current: string, option: string) {
  return current === option ? "" : option;
}

export function normalizedWeightedScore(fields: Array<[number, number]>) {
  const valid = fields.filter(([value]) => value > 0);
  if (!valid.length) return 0;

  const totalWeight = valid.reduce((sum, [, weight]) => sum + weight, 0);
  const score = valid.reduce((sum, [value, weight]) => sum + (value * weight) / totalWeight, 0);
  return Math.round(score * 10) / 10;
}

export function formatJournalDate(value: string) {
  if (!value) return "";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${month}/${day}/${year}`;
  }

  return value;
}

export function favoriteLabel(isFavorite: boolean) {
  return isFavorite ? "Remove from favorites" : "Add to favorites";
}

export function hasCatalogData(store: CatalogStore) {
  return store.brands.length > 0 || store.items.length > 0;
}

export function hasDraftData(draft: {
  form: PipeFormState;
  timeOfDay: string;
  blendType: string;
  cutType: string;
  nicotineStrength: string;
  components: string[];
  ratings: PipeRatings;
  entryMode: EntryMode;
}) {
  const { form, ratings } = draft;
  return Boolean(
    form.brand.trim() ||
      form.blendName.trim() ||
      form.date.trim() ||
      form.setting.trim() ||
      form.location.trim() ||
      form.pipeUsed.trim() ||
      form.lighterUsed.trim() ||
      form.quickNotes.trim() ||
      form.firstThirdNotes.trim() ||
      form.middleThirdNotes.trim() ||
      form.finalThirdNotes.trim() ||
      form.tinNotes.trim() ||
      form.yearBlended.trim() ||
      form.prepNotes.trim() ||
      draft.timeOfDay !== "Evening" ||
      draft.blendType !== "English" ||
      draft.cutType !== "Ribbon" ||
      draft.nicotineStrength !== "Medium" ||
      draft.entryMode !== "quick" ||
      draft.components.join("|") !== "Latakia|Orientals" ||
      Object.values(ratings).some((value) => value > 0)
  );
}

export function isPipeEntryFull(entry: PipeEntry) {
  return Boolean(
    entry.setting ||
      entry.location ||
      entry.lighterUsed ||
      entry.firstThirdNotes ||
      entry.middleThirdNotes ||
      entry.finalThirdNotes ||
      entry.tinNotes ||
      entry.yearBlended ||
      entry.prepNotes ||
      entry.ratings.tin > 0 ||
      entry.ratings.mechanics > 0
  );
}

export function isSpiritEntryFull(entry: SpiritEntry) {
  return Boolean(
    entry.ageStatement ||
      entry.mashbill ||
      entry.barrelTypeFinish ||
      entry.batchBarrelNumber ||
      entry.color ||
      entry.clarity ||
      entry.legs ||
      entry.beading ||
      entry.glass ||
      entry.aromaComplexity ||
      entry.aromaNotes ||
      entry.palateSweetness ||
      entry.palateTexture ||
      entry.palateBody ||
      entry.palateNotes ||
      entry.flavorNotes.length > 0 ||
      entry.finishLength ||
      entry.finishNotes ||
      entry.pricePaid
  );
}

export function isCigarEntryFull(entry: CigarEntry) {
  return Boolean(
    entry.purchaseDate ||
      entry.boughtFrom ||
      entry.price ||
      entry.restTime ||
      entry.setting ||
      entry.location ||
      entry.cutType ||
      entry.countryFactory ||
      entry.wrapper ||
      entry.binder ||
      entry.filler ||
      entry.strengthBand !== "Medium" ||
      entry.flavorNotes.length > 0 ||
      entry.firstThirdNotes ||
      entry.middleThirdNotes ||
      entry.finalThirdNotes ||
      entry.pairing ||
      entry.buyAgain ||
      entry.ratings.construction > 0
  );
}

export function getEntryDisplayTitle(entry: JournalEntry) {
  if (entry.category === "pipe") return entry.blendName;
  if (entry.category === "cigar") return entry.lineName;
  return entry.name;
}

export function getEntryMetaLine(entry: JournalEntry) {
  const parts = [formatJournalDate(entry.date) || "No date"];
  if (entry.category === "pipe" || entry.category === "cigar") {
    if (entry.timeOfDay) parts.push(entry.timeOfDay);
  }
  if (entry.brand) parts.push(entry.brand);
  return parts.join(" · ");
}

export function getEntrySearchText(entry: JournalEntry) {
  if (entry.category === "pipe") {
    return [
      entry.brand,
      entry.blendName,
      entry.quickNotes,
      entry.location,
      entry.setting,
      entry.pipeUsed,
      entry.firstThirdNotes,
      entry.middleThirdNotes,
      entry.finalThirdNotes
    ]
      .join(" ")
      .toLowerCase();
  }

  if (entry.category === "cigar") {
    return [
      entry.brand,
      entry.lineName,
      entry.quickNotes,
      entry.location,
      entry.setting,
      entry.vitola,
      entry.countryFactory,
      entry.wrapper,
      entry.binder,
      entry.filler,
      entry.firstThirdNotes,
      entry.middleThirdNotes,
      entry.finalThirdNotes,
      entry.pairing
    ]
      .join(" ")
      .toLowerCase();
  }

  return [
    entry.brand,
    entry.name,
    entry.spiritType,
    entry.proof,
    entry.drinkStyle,
    entry.pricePaid,
    entry.overallImpression,
    entry.buyAgain,
    ...entry.quickTags
  ]
    .join(" ")
    .toLowerCase();
}

export function cigarStrengthIndex(value: string) {
  const index = cigarStrengthOptions.indexOf(value as (typeof cigarStrengthOptions)[number]);
  return index >= 0 ? index : 2;
}

export function formatSpiritProof(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/[a-z%]/i.test(trimmed)) return trimmed;
  return `${trimmed} proof`;
}

export function getSpiritRatingLabel(value: number) {
  if (value >= 9) return "Top Shelf";
  if (value >= 7) return "Keeper";
  if (value >= 5) return "Solid Pour";
  if (value >= 3) return "Occasional Sip";
  if (value > 0) return "Pass";
  return "Not Rated";
}
