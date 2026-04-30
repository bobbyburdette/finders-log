import {
  createUserCatalogBrand,
  createUserCatalogItem,
  findBrandByExactName,
  findItemByExactName,
  getBrandById,
  getCatalogItemDisplayName,
  getItemById,
  mergeCatalogStores,
  searchBrands,
  searchItems,
  type CatalogBrand,
  type CatalogItem,
  type CatalogItemMetadata,
  type CatalogStore,
  type CatalogSuggestion,
  type CatalogType
} from "@/lib/catalog";
import { seedCatalog } from "@/lib/catalog-seed";
import { browserPipeJournalRepository } from "@/lib/data/pipe-journal-repository";

export interface CatalogService {
  loadUserCatalog(): CatalogStore;
  saveUserCatalog(store: CatalogStore): void;
  getCatalogStore(userCatalog: CatalogStore): CatalogStore;
  searchBrands(store: CatalogStore, type: CatalogType, query: string, limit?: number): CatalogSuggestion[];
  searchItems(
    store: CatalogStore,
    type: CatalogType,
    query: string,
    options?: { brandId?: string | null; limit?: number }
  ): CatalogSuggestion[];
  findBrandByExactName(store: CatalogStore, type: CatalogType, value: string): CatalogBrand | null;
  findItemByExactName(
    store: CatalogStore,
    type: CatalogType,
    value: string,
    brandId?: string | null
  ): CatalogItem | null;
  getBrandById(store: CatalogStore, brandId: string | null): CatalogBrand | null;
  getItemById(store: CatalogStore, itemId: string): CatalogItem | null;
  getCatalogItemDisplayName(store: CatalogStore, item: CatalogItem): string;
  createUserBrand(type: CatalogType, name: string): CatalogBrand;
  createUserItem(
    type: CatalogType,
    name: string,
    brandId: string | null,
    metadata?: CatalogItemMetadata
  ): CatalogItem;
}

export const browserCatalogService: CatalogService = {
  loadUserCatalog() {
    return browserPipeJournalRepository.loadUserCatalog();
  },

  saveUserCatalog(store) {
    browserPipeJournalRepository.saveUserCatalog(store);
  },

  getCatalogStore(userCatalog) {
    return mergeCatalogStores(seedCatalog, userCatalog);
  },

  searchBrands(store, type, query, limit) {
    return searchBrands(store, type, query, limit);
  },

  searchItems(store, type, query, options) {
    return searchItems(store, type, query, options);
  },

  findBrandByExactName(store, type, value) {
    return findBrandByExactName(store, type, value);
  },

  findItemByExactName(store, type, value, brandId) {
    return findItemByExactName(store, type, value, brandId);
  },

  getBrandById(store, brandId) {
    return getBrandById(store, brandId);
  },

  getItemById(store, itemId) {
    return getItemById(store, itemId);
  },

  getCatalogItemDisplayName(store, item) {
    return getCatalogItemDisplayName(store, item);
  },

  createUserBrand(type, name) {
    return createUserCatalogBrand(type, name);
  },

  createUserItem(type, name, brandId, metadata) {
    return createUserCatalogItem(type, name, brandId, metadata);
  }
};

export function createApiCatalogService(): CatalogService {
  throw new Error("Use the remote catalog service async helpers until the Supabase-backed implementation is connected.");
}
