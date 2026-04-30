import { backendConfig } from "@/lib/backend-config";
import { requestJson } from "@/lib/services/http-client";

type BackendStatusResponse = {
  provider: string;
  status: string;
  message: string;
};

export async function fetchBackendStatus() {
  return requestJson<BackendStatusResponse>(`${backendConfig.apiBaseUrl}/api/v1/backend/status`);
}
