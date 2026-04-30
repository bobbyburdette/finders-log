import { backendConfig } from "@/lib/backend-config";
import type { CollectionState } from "@/lib/collection";
import { requestJson } from "@/lib/services/http-client";

type CollectionResponse = {
  collection: CollectionState;
};

export async function fetchRemoteCollectionState() {
  const url = `${backendConfig.apiBaseUrl}/api/v1/collection`;
  const payload = await requestJson<CollectionResponse>(url);
  return payload.collection;
}

export async function saveRemoteCollectionState(collection: CollectionState) {
  const url = `${backendConfig.apiBaseUrl}/api/v1/collection`;
  await requestJson<CollectionResponse>(url, {
    method: "PUT",
    body: { collection }
  });
}
