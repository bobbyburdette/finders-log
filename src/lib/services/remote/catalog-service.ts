import { backendConfig } from "@/lib/backend-config";
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
import { requestJson } from "@/lib/services/http-client";
import { browserCatalogService, type CatalogService } from "@/lib/services/catalog-service";

type UserCatalogResponse = {
  userCatalog: CatalogStore;
};

export function createRemoteCatalogService(): CatalogService {
  return {
    loadUserCatalog() {
      return browserCatalogService.loadUserCatalog();
    },

    saveUserCatalog(store) {
      browserCatalogService.saveUserCatalog(store);
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
}

export async function fetchRemoteUserCatalog() {
  const url = `${backendConfig.apiBaseUrl}/api/v1/catalog/user`;
  const payload = await requestJson<UserCatalogResponse>(url);
  return payload.userCatalog;
}

export async function saveRemoteUserCatalog(userCatalog: CatalogStore) {
  const url = `${backendConfig.apiBaseUrl}/api/v1/catalog/user`;
  await requestJson<UserCatalogResponse>(url, {
    method: "PUT",
    body: { userCatalog }
  });
}
