import type { CatalogStore } from "@/lib/catalog";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function ensureCloudSafeCatalogIds(
  store: CatalogStore,
  createId: () => string = () => crypto.randomUUID()
): CatalogStore {
  const brandIds = new Map<string, string>();
  const brands = store.brands.map((brand) => {
    const id = isUuid(brand.id) ? brand.id : createId();
    brandIds.set(brand.id, id);
    return id === brand.id ? brand : { ...brand, id };
  });

  const items = store.items.map((item) => {
    const id = isUuid(item.id) ? item.id : createId();
    const brandId = item.brandId ? brandIds.get(item.brandId) ?? item.brandId : null;

    return id === item.id && brandId === item.brandId ? item : { ...item, id, brandId };
  });

  return { brands, items };
}
