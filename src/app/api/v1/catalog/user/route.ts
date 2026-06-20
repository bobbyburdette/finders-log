import { NextResponse } from "next/server";
import { jsonError, requireSupabaseUser } from "@/lib/server/api-helpers";
import { mapCatalogStoreToBrandRows, mapCatalogStoreToItemRows, mapUserCatalogRowsToStore } from "@/lib/server/catalog-records";
import type { CatalogStore } from "@/lib/catalog";
import { getStaleIds } from "@/lib/sync-reconciliation";

export async function GET() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const [{ data: brandRows, error: brandError }, { data: itemRows, error: itemError }] = await Promise.all([
    auth.supabase.from("user_catalog_brand").select("id, catalog_type, name, normalized_name, aliases, created_at").eq("user_id", auth.userId),
    auth.supabase.from("user_catalog_item").select("id, catalog_type, brand_name, item_name, normalized_item_name, metadata, created_at").eq("user_id", auth.userId)
  ]);

  if (brandError || itemError) {
    return jsonError("Failed to load the personal catalog from Supabase.", 500, {
      detail: brandError?.message ?? itemError?.message
    });
  }

  return NextResponse.json({
    userCatalog: mapUserCatalogRowsToStore((brandRows ?? []) as never, (itemRows ?? []) as never)
  });
}

export async function PUT(request: Request) {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { userCatalog?: CatalogStore } | null;
  const userCatalog = body?.userCatalog;

  if (!userCatalog || !Array.isArray(userCatalog.brands) || !Array.isArray(userCatalog.items)) {
    return jsonError("User catalog payload must include brands and items arrays.", 400);
  }

  const brandRows = mapCatalogStoreToBrandRows(auth.userId, userCatalog);
  const itemRows = mapCatalogStoreToItemRows(auth.userId, userCatalog);
  const [{ data: existingBrands, error: existingBrandError }, { data: existingItems, error: existingItemError }] =
    await Promise.all([
      auth.supabase.from("user_catalog_brand").select("id").eq("user_id", auth.userId),
      auth.supabase.from("user_catalog_item").select("id").eq("user_id", auth.userId)
    ]);

  if (existingBrandError || existingItemError) {
    return jsonError("Failed to inspect the saved personal catalog.", 500, {
      detail: existingBrandError?.message ?? existingItemError?.message
    });
  }

  if (brandRows.length) {
    const { error } = await auth.supabase.from("user_catalog_brand").upsert(brandRows, { onConflict: "id" });
    if (error) {
      return jsonError("Failed to save user catalog brands.", 500, { detail: error.message });
    }
  }

  if (itemRows.length) {
    const { error } = await auth.supabase.from("user_catalog_item").upsert(itemRows, { onConflict: "id" });
    if (error) {
      return jsonError("Failed to save user catalog items.", 500, { detail: error.message });
    }
  }

  const brandIdsToDelete = getStaleIds((existingBrands ?? []) as Array<{ id: string }>, brandRows);
  const itemIdsToDelete = getStaleIds((existingItems ?? []) as Array<{ id: string }>, itemRows);

  if (itemIdsToDelete.length) {
    const { error } = await auth.supabase
      .from("user_catalog_item")
      .delete()
      .eq("user_id", auth.userId)
      .in("id", itemIdsToDelete);
    if (error) {
      return jsonError("Failed to remove old user catalog items.", 500, { detail: error.message });
    }
  }

  if (brandIdsToDelete.length) {
    const { error } = await auth.supabase
      .from("user_catalog_brand")
      .delete()
      .eq("user_id", auth.userId)
      .in("id", brandIdsToDelete);
    if (error) {
      return jsonError("Failed to remove old user catalog brands.", 500, { detail: error.message });
    }
  }

  return NextResponse.json({ userCatalog });
}
