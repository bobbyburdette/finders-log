import { NextResponse } from "next/server";
import { jsonError, requireSupabaseUser } from "@/lib/server/api-helpers";
import { mapCatalogStoreToBrandRows, mapCatalogStoreToItemRows, mapUserCatalogRowsToStore } from "@/lib/server/catalog-records";
import type { CatalogStore } from "@/lib/catalog";

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

  const { error: deleteBrandError } = await auth.supabase.from("user_catalog_brand").delete().eq("user_id", auth.userId);
  if (deleteBrandError) {
    return jsonError("Failed to reset saved user brands.", 500, { detail: deleteBrandError.message });
  }

  const { error: deleteItemError } = await auth.supabase.from("user_catalog_item").delete().eq("user_id", auth.userId);
  if (deleteItemError) {
    return jsonError("Failed to reset saved user catalog items.", 500, { detail: deleteItemError.message });
  }

  const brandRows = mapCatalogStoreToBrandRows(auth.userId, userCatalog);
  const itemRows = mapCatalogStoreToItemRows(auth.userId, userCatalog);

  if (brandRows.length) {
    const { error } = await auth.supabase.from("user_catalog_brand").insert(brandRows);
    if (error) {
      return jsonError("Failed to save user catalog brands.", 500, { detail: error.message });
    }
  }

  if (itemRows.length) {
    const { error } = await auth.supabase.from("user_catalog_item").insert(itemRows);
    if (error) {
      return jsonError("Failed to save user catalog items.", 500, { detail: error.message });
    }
  }

  return NextResponse.json({ userCatalog });
}
