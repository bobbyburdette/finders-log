import { NextResponse } from "next/server";
import { emptyCollectionState, type CollectionState } from "@/lib/collection";
import { jsonError, requireSupabaseUser } from "@/lib/server/api-helpers";
import { mapCollectionRowsToState, mapCollectionStateToItemRows, mapCollectionStateToWishlistRows } from "@/lib/server/collection-records";

type CollectionResponse = {
  collection: CollectionState;
};

export async function GET() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const [{ data: itemRows, error: itemError }, { data: wishlistRows, error: wishlistError }] = await Promise.all([
    auth.supabase
      .from("collection_item")
      .select("id, category, name, status, quantity, acquired_on, detail, created_at")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false }),
    auth.supabase
      .from("wishlist_item")
      .select("id, category, name, fulfilled_at")
      .eq("user_id", auth.userId)
      .is("fulfilled_at", null)
      .order("created_at", { ascending: false })
  ]);

  if (itemError) {
    return jsonError("Failed to load the collection from Supabase.", 500, { detail: itemError.message });
  }

  if (wishlistError) {
    return jsonError("Failed to load the collection wishlist from Supabase.", 500, { detail: wishlistError.message });
  }

  return NextResponse.json({
    collection: mapCollectionRowsToState((itemRows ?? []) as never[], (wishlistRows ?? []) as never[])
  } satisfies CollectionResponse);
}

export async function PUT(request: Request) {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as CollectionResponse | null;
  const collection = body?.collection ?? null;

  if (!collection) {
    return jsonError("Collection payload must include a collection object.", 400);
  }

  const itemRows = mapCollectionStateToItemRows(auth.userId, collection);
  const wishlistRows = mapCollectionStateToWishlistRows(auth.userId, collection);
  const incomingItemIds = itemRows.map((row) => row.id);

  const { data: existingRows, error: existingError } = await auth.supabase
    .from("collection_item")
    .select("id")
    .eq("user_id", auth.userId);

  if (existingError) {
    return jsonError("Failed to inspect existing collection items.", 500, { detail: existingError.message });
  }

  const existingIds = (existingRows ?? []).map((row) => row.id as string);
  const idsToDelete = existingIds.filter((id) => !incomingItemIds.includes(id));

  if (idsToDelete.length) {
    const { error: deleteError } = await auth.supabase
      .from("collection_item")
      .delete()
      .eq("user_id", auth.userId)
      .in("id", idsToDelete);

    if (deleteError) {
      return jsonError("Failed to remove old collection items.", 500, { detail: deleteError.message });
    }
  }

  if (itemRows.length) {
    const { error: upsertError } = await auth.supabase
      .from("collection_item")
      .upsert(itemRows, { onConflict: "id" });

    if (upsertError) {
      return jsonError("Failed to save collection items to Supabase.", 500, { detail: upsertError.message });
    }
  }

  const { error: clearWishlistError } = await auth.supabase
    .from("wishlist_item")
    .delete()
    .eq("user_id", auth.userId)
    .in("category", ["cigar", "pipe", "spirits"]);

  if (clearWishlistError) {
    return jsonError("Failed to clear existing collection wishlist items.", 500, { detail: clearWishlistError.message });
  }

  if (wishlistRows.length) {
    const { error: wishlistUpsertError } = await auth.supabase.from("wishlist_item").insert(wishlistRows);

    if (wishlistUpsertError) {
      return jsonError("Failed to save collection wishlist items to Supabase.", 500, { detail: wishlistUpsertError.message });
    }
  }

  return NextResponse.json({
    collection
  } satisfies CollectionResponse);
}

export async function DELETE() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth.response;

  const [{ error: itemDeleteError }, { error: wishlistDeleteError }] = await Promise.all([
    auth.supabase.from("collection_item").delete().eq("user_id", auth.userId),
    auth.supabase.from("wishlist_item").delete().eq("user_id", auth.userId).in("category", ["cigar", "pipe", "spirits"])
  ]);

  if (itemDeleteError) {
    return jsonError("Failed to clear the collection from Supabase.", 500, { detail: itemDeleteError.message });
  }

  if (wishlistDeleteError) {
    return jsonError("Failed to clear the collection wishlist from Supabase.", 500, { detail: wishlistDeleteError.message });
  }

  return NextResponse.json({
    collection: emptyCollectionState()
  } satisfies CollectionResponse);
}
