import { browserPipeJournalRepository } from "@/lib/data/pipe-journal-repository";
import type { PipeDraftState, PipeEntry } from "@/lib/pipe-journal";

export interface PipeEntryService {
  loadEntries(): PipeEntry[];
  saveEntries(entries: PipeEntry[]): void;
  loadDraft(): PipeDraftState | null;
  saveDraft(draft: PipeDraftState): void;
  clearDraft(): void;
}

export const browserPipeEntryService: PipeEntryService = {
  loadEntries() {
    return browserPipeJournalRepository.loadPipeEntries();
  },

  saveEntries(entries) {
    browserPipeJournalRepository.savePipeEntries(entries);
  },

  loadDraft() {
    return browserPipeJournalRepository.loadPipeDraft();
  },

  saveDraft(draft) {
    browserPipeJournalRepository.savePipeDraft(draft);
  },

  clearDraft() {
    browserPipeJournalRepository.clearPipeDraft();
  }
};

export function createApiPipeEntryService(): PipeEntryService {
  throw new Error("Use the remote pipe entry async helpers until the Supabase-backed implementation is connected.");
}
