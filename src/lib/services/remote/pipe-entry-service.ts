import { backendConfig } from "@/lib/backend-config";
import { requestJson } from "@/lib/services/http-client";
import { browserPipeEntryService } from "@/lib/services/pipe-entry-service";
import type { PipeDraftState, PipeEntry } from "@/lib/pipe-journal";
import type { PipeEntryService } from "@/lib/services/pipe-entry-service";

type PipeEntriesResponse = {
  entries: PipeEntry[];
};

type PipeDraftResponse = {
  draft: PipeDraftState | null;
};

export function createRemotePipeEntryService(): PipeEntryService {
  return {
    loadEntries() {
      return browserPipeEntryService.loadEntries();
    },

    saveEntries(entries) {
      browserPipeEntryService.saveEntries(entries);
    },

    loadDraft() {
      return browserPipeEntryService.loadDraft();
    },

    saveDraft(draft) {
      browserPipeEntryService.saveDraft(draft);
    },

    clearDraft() {
      browserPipeEntryService.clearDraft();
    }
  };
}

export async function fetchRemotePipeEntries() {
  const url = `${backendConfig.apiBaseUrl}/api/v1/pipe-entries`;
  const payload = await requestJson<PipeEntriesResponse>(url);
  return payload.entries;
}

export async function saveRemotePipeEntries(entries: PipeEntry[]) {
  const url = `${backendConfig.apiBaseUrl}/api/v1/pipe-entries`;
  await requestJson<PipeEntriesResponse>(url, {
    method: "PUT",
    body: { entries }
  });
}

export async function fetchRemotePipeDraft() {
  const url = `${backendConfig.apiBaseUrl}/api/v1/pipe-draft`;
  const payload = await requestJson<PipeDraftResponse>(url);
  return payload.draft;
}

export async function saveRemotePipeDraft(draft: PipeDraftState) {
  const url = `${backendConfig.apiBaseUrl}/api/v1/pipe-draft`;
  await requestJson<PipeDraftResponse>(url, {
    method: "PUT",
    body: { draft }
  });
}

export async function clearRemotePipeDraft() {
  const url = `${backendConfig.apiBaseUrl}/api/v1/pipe-draft`;
  await requestJson<PipeDraftResponse>(url, {
    method: "DELETE"
  });
}
