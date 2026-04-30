import type { CatalogStore } from "@/lib/catalog";
import type { CigarDraftState, CigarEntry } from "@/lib/cigar-journal";
import type { PipeDraftState, PipeEntry } from "@/lib/pipe-journal";
import type { SpiritDraftState, SpiritEntry } from "@/lib/spirit-journal";

const PIPE_ENTRIES_KEY = "finders-log.pipe.entries";
const PIPE_DRAFT_KEY = "finders-log.pipe.draft";
const CIGAR_ENTRIES_KEY = "finders-log.cigar.entries";
const CIGAR_DRAFT_KEY = "finders-log.cigar.draft";
const SPIRIT_ENTRIES_KEY = "finders-log.spirit.entries";
const SPIRIT_DRAFT_KEY = "finders-log.spirit.draft";
const USER_CATALOG_KEY = "finders-log.catalog.user.v1";

export interface PipeJournalRepository {
  loadPipeEntries(): PipeEntry[];
  savePipeEntries(entries: PipeEntry[]): void;
  loadPipeDraft(): PipeDraftState | null;
  savePipeDraft(draft: PipeDraftState): void;
  clearPipeDraft(): void;
  loadCigarEntries(): CigarEntry[];
  saveCigarEntries(entries: CigarEntry[]): void;
  loadCigarDraft(): CigarDraftState | null;
  saveCigarDraft(draft: CigarDraftState): void;
  clearCigarDraft(): void;
  loadSpiritEntries(): SpiritEntry[];
  saveSpiritEntries(entries: SpiritEntry[]): void;
  loadSpiritDraft(): SpiritDraftState | null;
  saveSpiritDraft(draft: SpiritDraftState): void;
  clearSpiritDraft(): void;
  loadUserCatalog(): CatalogStore;
  saveUserCatalog(store: CatalogStore): void;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse stored Pipe Journal data", error);
    return fallback;
  }
}

export const browserPipeJournalRepository: PipeJournalRepository = {
  loadPipeEntries() {
    return safeParse<PipeEntry[]>(window.localStorage.getItem(PIPE_ENTRIES_KEY), []);
  },

  savePipeEntries(entries) {
    window.localStorage.setItem(PIPE_ENTRIES_KEY, JSON.stringify(entries));
  },

  loadPipeDraft() {
    return safeParse<PipeDraftState | null>(window.localStorage.getItem(PIPE_DRAFT_KEY), null);
  },

  savePipeDraft(draft) {
    window.localStorage.setItem(PIPE_DRAFT_KEY, JSON.stringify(draft));
  },

  clearPipeDraft() {
    window.localStorage.removeItem(PIPE_DRAFT_KEY);
  },

  loadCigarEntries() {
    return safeParse<CigarEntry[]>(window.localStorage.getItem(CIGAR_ENTRIES_KEY), []);
  },

  saveCigarEntries(entries) {
    window.localStorage.setItem(CIGAR_ENTRIES_KEY, JSON.stringify(entries));
  },

  loadCigarDraft() {
    return safeParse<CigarDraftState | null>(window.localStorage.getItem(CIGAR_DRAFT_KEY), null);
  },

  saveCigarDraft(draft) {
    window.localStorage.setItem(CIGAR_DRAFT_KEY, JSON.stringify(draft));
  },

  clearCigarDraft() {
    window.localStorage.removeItem(CIGAR_DRAFT_KEY);
  },

  loadSpiritEntries() {
    return safeParse<SpiritEntry[]>(window.localStorage.getItem(SPIRIT_ENTRIES_KEY), []);
  },

  saveSpiritEntries(entries) {
    window.localStorage.setItem(SPIRIT_ENTRIES_KEY, JSON.stringify(entries));
  },

  loadSpiritDraft() {
    return safeParse<SpiritDraftState | null>(window.localStorage.getItem(SPIRIT_DRAFT_KEY), null);
  },

  saveSpiritDraft(draft) {
    window.localStorage.setItem(SPIRIT_DRAFT_KEY, JSON.stringify(draft));
  },

  clearSpiritDraft() {
    window.localStorage.removeItem(SPIRIT_DRAFT_KEY);
  },

  loadUserCatalog() {
    return safeParse<CatalogStore>(window.localStorage.getItem(USER_CATALOG_KEY), {
      brands: [],
      items: []
    });
  },

  saveUserCatalog(store) {
    window.localStorage.setItem(USER_CATALOG_KEY, JSON.stringify(store));
  }
};
