import assert from "node:assert/strict";
import test from "node:test";
import { ensureCloudSafeCatalogIds } from "./catalog-cloud-ids.ts";
import type { CatalogStore } from "./catalog.ts";

test("replaces legacy catalog IDs and preserves item-to-brand relationships", () => {
  const ids = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222"
  ];
  const store: CatalogStore = {
    brands: [
      {
        id: "user-brand-cigars-old",
        type: "cigars",
        name: "Example Brand",
        normalizedName: "example brand",
        aliases: [],
        status: "active",
        source: "user"
      }
    ],
    items: [
      {
        id: "user-item-cigars-old",
        type: "cigars",
        brandId: "user-brand-cigars-old",
        name: "Example Cigar",
        normalizedName: "example cigar",
        aliases: [],
        status: "active",
        source: "user",
        metadata: {}
      }
    ]
  };

  const result = ensureCloudSafeCatalogIds(store, () => ids.shift()!);

  assert.equal(result.brands[0]?.id, "11111111-1111-4111-8111-111111111111");
  assert.equal(result.items[0]?.id, "22222222-2222-4222-8222-222222222222");
  assert.equal(result.items[0]?.brandId, result.brands[0]?.id);
});
