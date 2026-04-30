import { backendConfig } from "@/lib/backend-config";
import { browserCatalogService, type CatalogService } from "@/lib/services/catalog-service";
import { browserPipeEntryService, type PipeEntryService } from "@/lib/services/pipe-entry-service";
import { createRemoteCatalogService } from "@/lib/services/remote/catalog-service";
import { createRemotePipeEntryService } from "@/lib/services/remote/pipe-entry-service";

export interface AppServices {
  catalogService: CatalogService;
  pipeEntryService: PipeEntryService;
}

export function createAppServices(): AppServices {
  if (backendConfig.currentDataProvider === "supabase") {
    return {
      catalogService: createRemoteCatalogService(),
      pipeEntryService: createRemotePipeEntryService()
    };
  }

  return {
    catalogService: browserCatalogService,
    pipeEntryService: browserPipeEntryService
  };
}

export const appServices = createAppServices();
