export type SpiritRating = number;

export type SpiritFormState = {
  name: string;
  brand: string;
  date: string;
  timeOfDay: string;
  spiritType: string;
  ageStatement: string;
  proof: string;
  mashbill: string;
  barrelTypeFinish: string;
  batchBarrelNumber: string;
  color: string;
  clarity: string;
  legs: string;
  beading: string;
  glass: string;
  aromaComplexity: string;
  aromaNotes: string;
  palateSweetness: string;
  palateTexture: string;
  palateBody: string;
  palateNotes: string;
  flavorNotes: string[];
  finishLength: string;
  finishNotes: string;
  pricePaid: string;
  drinkStyle: string;
  overallImpression: string;
  buyAgain: string;
  quickTags: string[];
};

export type SpiritEntry = {
  id: string;
  category: "spirits";
  entryMode?: "quick" | "full";
  brandId: string | null;
  spiritItemId: string | null;
  catalogSource: "seed" | "user" | "manual";
  name: string;
  brand: string;
  date: string;
  timeOfDay: string;
  spiritType: string;
  ageStatement: string;
  proof: string;
  mashbill: string;
  barrelTypeFinish: string;
  batchBarrelNumber: string;
  color: string;
  clarity: string;
  legs: string;
  beading: string;
  glass: string;
  aromaComplexity: string;
  aromaNotes: string;
  palateSweetness: string;
  palateTexture: string;
  palateBody: string;
  palateNotes: string;
  flavorNotes: string[];
  finishLength: string;
  finishNotes: string;
  pricePaid: string;
  drinkStyle: string;
  overallImpression: string;
  buyAgain: string;
  quickTags: string[];
  isFavorite: boolean;
  rating: SpiritRating;
  suggestedScore: number;
  createdAt: string;
};

export type SpiritDraftState = {
  form: SpiritFormState;
  rating: SpiritRating;
  entryMode: "quick" | "full";
};

export const defaultSpiritForm: SpiritFormState = {
  name: "",
  brand: "",
  date: "",
  timeOfDay: "Evening",
  spiritType: "Bourbon",
  ageStatement: "",
  proof: "",
  mashbill: "",
  barrelTypeFinish: "",
  batchBarrelNumber: "",
  color: "",
  clarity: "",
  legs: "",
  beading: "",
  glass: "",
  aromaComplexity: "",
  aromaNotes: "",
  palateSweetness: "",
  palateTexture: "",
  palateBody: "",
  palateNotes: "",
  flavorNotes: [],
  finishLength: "",
  finishNotes: "",
  pricePaid: "",
  drinkStyle: "Neat",
  overallImpression: "",
  buyAgain: "",
  quickTags: []
};
