import type { CatalogBrand, CatalogItem, CatalogStore } from "@/lib/catalog";

type UserCatalogBrandRow = {
  id: string;
  catalog_type: string;
  name: string;
  normalized_name: string;
  aliases: string[] | null;
  created_at: string | null;
};

type UserCatalogItemRow = {
  id: string;
  catalog_type: string;
  brand_name: string | null;
  item_name: string;
  normalized_item_name: string;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

function dbCatalogTypeToApp(value: string): CatalogBrand["type"] {
  if (value === "pipe_tobaccos") return "pipeTobaccos";
  if (value === "pipes") return "pipes";
  if (value === "cigars") return "cigars";
  return "spirits";
}

function appCatalogTypeToDb(value: CatalogBrand["type"]) {
  if (value === "pipeTobaccos") return "pipe_tobaccos";
  return value;
}

export function mapUserCatalogRowsToStore(
  brandRows: UserCatalogBrandRow[],
  itemRows: UserCatalogItemRow[]
): CatalogStore {
  const brands: CatalogBrand[] = brandRows.map((row) => ({
    id: row.id,
    type: dbCatalogTypeToApp(row.catalog_type),
    name: row.name,
    normalizedName: row.normalized_name,
    aliases: Array.isArray(row.aliases) ? row.aliases : [],
    status: "active",
    source: "user",
    createdAt: row.created_at ?? undefined
  }));

  const brandIdsByName = new Map(brands.map((brand) => [`${brand.type}:${brand.name.toLowerCase()}`, brand.id]));

  const items: CatalogItem[] = itemRows.map((row) => {
    const type = dbCatalogTypeToApp(row.catalog_type);
    const brandId = row.brand_name ? brandIdsByName.get(`${type}:${row.brand_name.toLowerCase()}`) ?? null : null;

    return {
      id: row.id,
      type,
      brandId,
      name: row.item_name,
      normalizedName: row.normalized_item_name,
      aliases: [],
      status: "active",
      source: "user",
      metadata: row.metadata ?? {},
      createdAt: row.created_at ?? undefined
    };
  });

  return { brands, items };
}

export function mapCatalogStoreToBrandRows(userId: string, store: CatalogStore) {
  return store.brands.map((brand) => ({
    id: brand.id,
    user_id: userId,
    catalog_type: appCatalogTypeToDb(brand.type),
    name: brand.name,
    normalized_name: brand.normalizedName,
    aliases: brand.aliases
  }));
}

export function mapCatalogStoreToItemRows(userId: string, store: CatalogStore) {
  const brandNamesById = new Map(store.brands.map((brand) => [brand.id, brand.name]));

  return store.items.map((item) => ({
    id: item.id,
    user_id: userId,
    catalog_type: appCatalogTypeToDb(item.type),
    brand_name: item.brandId ? brandNamesById.get(item.brandId) ?? null : null,
    item_name: item.name,
    normalized_item_name: item.normalizedName,
    metadata: item.metadata
  }));
}
