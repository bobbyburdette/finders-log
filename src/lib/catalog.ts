export type CatalogType = "pipes" | "pipeTobaccos" | "cigars" | "spirits";

export type CatalogStatus = "active" | "discontinued" | "limited" | "seasonal";

export type CatalogSource = "seed" | "user";

export interface CatalogBrand {
  id: string;
  type: CatalogType;
  name: string;
  normalizedName: string;
  aliases: string[];
  status: CatalogStatus;
  source: CatalogSource;
  country?: string;
  createdAt?: string;
}

export interface PipeTobaccoMetadata {
  blendFamily?: string;
  cutType?: string;
  components?: string[];
  strength?: string;
}

export interface PipeMetadata {
  maker?: string;
  shape?: string;
  material?: string;
  finish?: string;
}

export interface CigarMetadata {
  line?: string;
  vitola?: string;
  wrapper?: string;
  binder?: string;
  filler?: string;
}

export interface SpiritMetadata {
  spiritType?: string;
  expression?: string;
  proof?: number;
  ageStatement?: string;
}

export type CatalogItemMetadata =
  | PipeTobaccoMetadata
  | PipeMetadata
  | CigarMetadata
  | SpiritMetadata;

export interface CatalogItem {
  id: string;
  type: CatalogType;
  brandId: string | null;
  name: string;
  normalizedName: string;
  aliases: string[];
  status: CatalogStatus;
  source: CatalogSource;
  metadata: CatalogItemMetadata;
  createdAt?: string;
}

export interface CatalogStore {
  brands: CatalogBrand[];
  items: CatalogItem[];
}

export interface CatalogSuggestion {
  id: string;
  label: string;
  detail?: string;
  source: CatalogSource;
}

export function normalizeCatalogText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function mergeCatalogStores(...stores: CatalogStore[]): CatalogStore {
  return {
    brands: stores.flatMap((store) => store.brands),
    items: stores.flatMap((store) => store.items)
  };
}

function catalogRecordMatches(query: string, value: string, aliases: string[]) {
  const normalizedQuery = normalizeCatalogText(query);
  if (!normalizedQuery) return true;

  const haystack = [value, ...aliases].map(normalizeCatalogText);
  return haystack.some((entry) => entry.includes(normalizedQuery));
}

export function findBrandByExactName(store: CatalogStore, type: CatalogType, value: string) {
  const normalized = normalizeCatalogText(value);
  if (!normalized) return null;

  return (
    store.brands.find(
      (brand) =>
        brand.type === type &&
        (brand.normalizedName === normalized ||
          brand.aliases.map(normalizeCatalogText).includes(normalized))
    ) ?? null
  );
}

export function findItemByExactName(
  store: CatalogStore,
  type: CatalogType,
  value: string,
  brandId?: string | null
) {
  const normalized = normalizeCatalogText(value);
  if (!normalized) return null;

  return (
    store.items.find(
      (item) =>
        item.type === type &&
        (brandId == null || item.brandId === brandId) &&
        (item.normalizedName === normalized ||
          item.aliases.map(normalizeCatalogText).includes(normalized))
    ) ?? null
  );
}

export function getBrandNameById(store: CatalogStore, brandId: string | null) {
  if (!brandId) return "";
  return store.brands.find((brand) => brand.id === brandId)?.name ?? "";
}

export function searchBrands(
  store: CatalogStore,
  type: CatalogType,
  query: string,
  limit = 6
): CatalogSuggestion[] {
  return store.brands
    .filter((brand) => brand.type === type)
    .filter((brand) => catalogRecordMatches(query, brand.name, brand.aliases))
    .sort((a, b) => {
      if (a.source !== b.source) return a.source === "seed" ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit)
    .map((brand) => ({
      id: brand.id,
      label: brand.name,
      detail: brand.country,
      source: brand.source
    }));
}

export function searchItems(
  store: CatalogStore,
  type: CatalogType,
  query: string,
  options?: { brandId?: string | null; limit?: number }
): CatalogSuggestion[] {
  const limit = options?.limit ?? 6;

  return store.items
    .filter((item) => item.type === type)
    .filter((item) => options?.brandId == null || item.brandId === options.brandId)
    .filter((item) => catalogRecordMatches(query, item.name, item.aliases))
    .sort((a, b) => {
      if (a.source !== b.source) return a.source === "seed" ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      label: item.name,
      detail: getBrandNameById(store, item.brandId) || undefined,
      source: item.source
    }));
}

export function createUserCatalogBrand(type: CatalogType, name: string): CatalogBrand {
  const timestamp = new Date().toISOString();
  return {
    id: `user-brand-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    name: name.trim(),
    normalizedName: normalizeCatalogText(name),
    aliases: [],
    status: "active",
    source: "user",
    createdAt: timestamp
  };
}

export function createUserCatalogItem(
  type: CatalogType,
  name: string,
  brandId: string | null,
  metadata: CatalogItemMetadata = {}
): CatalogItem {
  const timestamp = new Date().toISOString();
  return {
    id: `user-item-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    brandId,
    name: name.trim(),
    normalizedName: normalizeCatalogText(name),
    aliases: [],
    status: "active",
    source: "user",
    metadata,
    createdAt: timestamp
  };
}
