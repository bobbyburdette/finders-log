export type CollectionCigarItem = {
  id: string;
  brand: string;
  lineName: string;
  vitola: string;
  quantity: number;
  dateAdded: string;
  wrapperShade: string;
  status: string;
  notes: string;
  createdAt: string;
};

export type CollectionTobaccoItem = {
  id: string;
  name: string;
  brand: string;
  style: string;
  cut: string;
  tinDate: string;
  quantity: number;
  storageFormat: string;
  dateAcquired: string;
  source: string;
  nicotine: string;
  roomNote: string;
  status: string;
  discontinued: boolean;
  notes: string;
  createdAt: string;
};

export type CollectionPipeItem = {
  id: string;
  name: string;
  maker: string;
  shape: string;
  material: string;
  finish: string;
  stem: string;
  status: string;
  dateAcquired: string;
  source: string;
  notes: string;
  createdAt: string;
};

export type CollectionBottleItem = {
  id: string;
  name: string;
  distillery: string;
  spiritType: string;
  proof: string;
  age: string;
  status: string;
  notes: string;
  createdAt: string;
};

export type CollectionState = {
  cigars: CollectionCigarItem[];
  tobaccos: CollectionTobaccoItem[];
  pipes: CollectionPipeItem[];
  bottles: CollectionBottleItem[];
  wishlistCigars: string[];
  wishlistPipes: string[];
  wishlistBottles: string[];
};

export function emptyCollectionState(): CollectionState {
  return {
    cigars: [],
    tobaccos: [],
    pipes: [],
    bottles: [],
    wishlistCigars: [],
    wishlistPipes: [],
    wishlistBottles: []
  };
}

export function hasCollectionData(state: CollectionState) {
  return (
    state.cigars.length > 0 ||
    state.tobaccos.length > 0 ||
    state.pipes.length > 0 ||
    state.bottles.length > 0 ||
    state.wishlistCigars.length > 0 ||
    state.wishlistPipes.length > 0 ||
    state.wishlistBottles.length > 0
  );
}
