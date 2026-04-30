export type CigarRatings = {
  flavor: number;
  construction: number;
  draw: number;
  burn: number;
  aroma: number;
  strength: number;
  enjoyment: number;
};

export type CigarFormState = {
  brand: string;
  lineName: string;
  date: string;
  purchaseDate: string;
  boughtFrom: string;
  price: string;
  restTime: string;
  setting: string;
  location: string;
  vitola: string;
  cutType: string;
  countryFactory: string;
  wrapper: string;
  binder: string;
  filler: string;
  strengthBand: string;
  flavorNotes: string[];
  quickNotes: string;
  firstThirdNotes: string;
  middleThirdNotes: string;
  finalThirdNotes: string;
  pairing: string;
  buyAgain: string;
};

export type CigarEntry = {
  id: string;
  category: "cigar";
  entryMode?: "quick" | "full";
  brandId: string | null;
  cigarItemId: string | null;
  catalogSource: "seed" | "user" | "manual";
  brand: string;
  lineName: string;
  date: string;
  purchaseDate: string;
  boughtFrom: string;
  price: string;
  restTime: string;
  timeOfDay: string;
  setting: string;
  location: string;
  vitola: string;
  cutType: string;
  countryFactory: string;
  wrapper: string;
  binder: string;
  filler: string;
  strengthBand: string;
  flavorNotes: string[];
  quickNotes: string;
  firstThirdNotes: string;
  middleThirdNotes: string;
  finalThirdNotes: string;
  pairing: string;
  buyAgain: string;
  isFavorite: boolean;
  ratings: CigarRatings;
  suggestedScore: number;
  createdAt: string;
};

export type CigarDraftState = {
  form: CigarFormState;
  timeOfDay: string;
  wrapperShade: string;
  ratings: CigarRatings;
  entryMode: "quick" | "full";
};

export const defaultCigarForm: CigarFormState = {
  brand: "",
  lineName: "",
  date: "",
  purchaseDate: "",
  boughtFrom: "",
  price: "",
  restTime: "",
  setting: "",
  location: "",
  vitola: "",
  cutType: "",
  countryFactory: "",
  wrapper: "",
  binder: "",
  filler: "",
  strengthBand: "Medium",
  flavorNotes: [],
  quickNotes: "",
  firstThirdNotes: "",
  middleThirdNotes: "",
  finalThirdNotes: "",
  pairing: "",
  buyAgain: ""
};

export const defaultCigarRatings: CigarRatings = {
  flavor: 0,
  construction: 0,
  draw: 0,
  burn: 0,
  aroma: 0,
  strength: 0,
  enjoyment: 0
};
