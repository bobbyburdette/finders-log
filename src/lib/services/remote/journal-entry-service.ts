import { backendConfig } from "@/lib/backend-config";
import type { CigarEntry } from "@/lib/cigar-journal";
import type { PipeEntry } from "@/lib/pipe-journal";
import { requestJson } from "@/lib/services/http-client";
import type { SpiritEntry } from "@/lib/spirit-journal";

export type JournalEntryPayload = PipeEntry | CigarEntry | SpiritEntry;

type JournalEntriesResponse = {
  entries: JournalEntryPayload[];
  deletedEntryIds?: string[];
};

export async function fetchRemoteJournalState() {
  const url = `${backendConfig.apiBaseUrl}/api/v1/journal-entries`;
  return requestJson<JournalEntriesResponse>(url);
}

export async function fetchRemoteJournalEntries() {
  const payload = await fetchRemoteJournalState();
  return payload.entries;
}

export async function saveRemoteJournalEntries(entries: JournalEntryPayload[]) {
  const url = `${backendConfig.apiBaseUrl}/api/v1/journal-entries`;
  await requestJson<JournalEntriesResponse>(url, {
    method: "PUT",
    body: { entries }
  });
}

export async function deleteRemoteJournalEntry(id: string) {
  const url = `${backendConfig.apiBaseUrl}/api/v1/journal-entries`;
  await requestJson<{ id: string; deletedAt?: string }>(url, {
    method: "DELETE",
    body: { id }
  });
}
