import { emptyCollectionState, type CollectionBottleItem, type CollectionCigarItem, type CollectionPipeItem, type CollectionState, type CollectionTobaccoItem } from "@/lib/collection";

type CollectionItemCategory = "cigar" | "tin" | "pipe" | "bottle";
type WishlistCategory = "cigar" | "pipe" | "spirits";

type CollectionItemRow = {
  id: string;
  category: CollectionItemCategory;
  name: string;
  status: string | null;
  quantity: number | null;
  acquired_on: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
};

type WishlistItemRow = {
  id: string;
  category: WishlistCategory;
  name: string;
  fulfilled_at: string | null;
};

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

export function mapCollectionRowsToState(itemRows: CollectionItemRow[], wishlistRows: WishlistItemRow[]): CollectionState {
  const state = emptyCollectionState();

  for (const row of itemRows) {
    const detail = row.detail ?? {};

    if (row.category === "cigar") {
      const item: CollectionCigarItem = {
        id: row.id,
        brand: readString(detail.brand),
        lineName: readString(detail.lineName) || row.name,
        vitola: readString(detail.vitola),
        quantity: row.quantity ?? 1,
        dateAdded: row.acquired_on ?? "",
        wrapperShade: readString(detail.wrapperShade),
        status: row.status ?? "",
        notes: readString(detail.notes),
        createdAt: row.created_at
      };
      state.cigars.push(item);
      continue;
    }

    if (row.category === "tin") {
      const item: CollectionTobaccoItem = {
        id: row.id,
        name: row.name,
        brand: readString(detail.brand),
        style: readString(detail.style),
        cut: readString(detail.cut),
        tinDate: readString(detail.tinDate),
        quantity: row.quantity ?? 1,
        storageFormat: readString(detail.storageFormat),
        dateAcquired: row.acquired_on ?? "",
        source: readString(detail.source),
        nicotine: readString(detail.nicotine),
        roomNote: readString(detail.roomNote),
        status: row.status ?? "",
        discontinued: readBoolean(detail.discontinued),
        notes: readString(detail.notes),
        createdAt: row.created_at
      };
      state.tobaccos.push(item);
      continue;
    }

    if (row.category === "pipe") {
      const item: CollectionPipeItem = {
        id: row.id,
        name: row.name,
        maker: readString(detail.maker),
        shape: readString(detail.shape),
        material: readString(detail.material),
        finish: readString(detail.finish),
        stem: readString(detail.stem),
        status: row.status ?? "",
        dateAcquired: row.acquired_on ?? "",
        source: readString(detail.source),
        notes: readString(detail.notes),
        createdAt: row.created_at
      };
      state.pipes.push(item);
      continue;
    }

    const item: CollectionBottleItem = {
      id: row.id,
      name: row.name,
      distillery: readString(detail.distillery),
      spiritType: readString(detail.spiritType),
      proof: readString(detail.proof),
      age: readString(detail.age),
      status: row.status ?? "",
      notes: readString(detail.notes),
      createdAt: row.created_at
    };
    state.bottles.push(item);
  }

  for (const row of wishlistRows) {
    if (row.fulfilled_at) continue;
    if (row.category === "cigar") {
      state.wishlistCigars.push(row.name);
    } else if (row.category === "pipe") {
      state.wishlistPipes.push(row.name);
    } else if (row.category === "spirits") {
      state.wishlistBottles.push(row.name);
    }
  }

  return state;
}

export function mapCollectionStateToItemRows(userId: string, state: CollectionState) {
  return [
    ...state.cigars.map((item) => ({
      id: item.id,
      user_id: userId,
      category: "cigar" as const,
      name: item.lineName || item.brand,
      status: item.status || null,
      quantity: item.quantity,
      acquired_on: item.dateAdded || null,
      detail: {
        brand: item.brand,
        lineName: item.lineName,
        vitola: item.vitola,
        wrapperShade: item.wrapperShade,
        notes: item.notes
      }
    })),
    ...state.tobaccos.map((item) => ({
      id: item.id,
      user_id: userId,
      category: "tin" as const,
      name: item.name,
      status: item.status || null,
      quantity: item.quantity,
      acquired_on: item.dateAcquired || null,
      detail: {
        brand: item.brand,
        style: item.style,
        cut: item.cut,
        tinDate: item.tinDate,
        storageFormat: item.storageFormat,
        source: item.source,
        nicotine: item.nicotine,
        roomNote: item.roomNote,
        discontinued: item.discontinued,
        notes: item.notes
      }
    })),
    ...state.pipes.map((item) => ({
      id: item.id,
      user_id: userId,
      category: "pipe" as const,
      name: item.name,
      status: item.status || null,
      quantity: null,
      acquired_on: item.dateAcquired || null,
      detail: {
        maker: item.maker,
        shape: item.shape,
        material: item.material,
        finish: item.finish,
        stem: item.stem,
        source: item.source,
        notes: item.notes
      }
    })),
    ...state.bottles.map((item) => ({
      id: item.id,
      user_id: userId,
      category: "bottle" as const,
      name: item.name,
      status: item.status || null,
      quantity: null,
      acquired_on: null,
      detail: {
        distillery: item.distillery,
        spiritType: item.spiritType,
        proof: item.proof,
        age: item.age,
        notes: item.notes
      }
    }))
  ];
}

export function mapCollectionStateToWishlistRows(userId: string, state: CollectionState) {
  const rows = [
    ...state.wishlistCigars.map((name) => ({
      user_id: userId,
      category: "cigar" as const,
      name
    })),
    ...state.wishlistPipes.map((name) => ({
      user_id: userId,
      category: "pipe" as const,
      name
    })),
    ...state.wishlistBottles.map((name) => ({
      user_id: userId,
      category: "spirits" as const,
      name
    }))
  ];

  return rows;
}
