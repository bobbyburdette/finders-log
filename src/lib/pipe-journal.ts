export type PipeRatings = {
  flavor: number;
  strength: number;
  roomNote: number;
  performance: number;
  enjoyment: number;
  tin: number;
  mechanics: number;
};

export type PipeFormState = {
  brand: string;
  blendName: string;
  date: string;
  setting: string;
  location: string;
  pipeUsed: string;
  lighterUsed: string;
  quickNotes: string;
  firstThirdNotes: string;
  middleThirdNotes: string;
  finalThirdNotes: string;
  tinNotes: string;
  yearBlended: string;
  prepNotes: string;
};

export type EntryMode = "quick" | "full";

export type PipeEntry = {
  id: string;
  category: "pipe";
  entryMode?: EntryMode;
  brandId: string | null;
  blendId: string | null;
  pipeItemId?: string | null;
  catalogSource: "seed" | "user" | "manual";
  brand: string;
  blendName: string;
  date: string;
  timeOfDay: string;
  setting: string;
  location: string;
  pipeUsed: string;
  lighterUsed: string;
  blendType: string;
  cutType: string;
  nicotineStrength: string;
  components: string[];
  quickNotes: string;
  firstThirdNotes: string;
  middleThirdNotes: string;
  finalThirdNotes: string;
  tinNotes: string;
  yearBlended: string;
  prepNotes: string;
  isFavorite: boolean;
  ratings: PipeRatings;
  suggestedScore: number;
  createdAt: string;
};

export type PipeDraftState = {
  form: PipeFormState;
  timeOfDay: string;
  blendType: string;
  cutType: string;
  nicotineStrength: string;
  components: string[];
  ratings: PipeRatings;
  entryMode: EntryMode;
};

export const defaultPipeForm: PipeFormState = {
  brand: "",
  blendName: "",
  date: "",
  setting: "",
  location: "",
  pipeUsed: "",
  lighterUsed: "",
  quickNotes: "",
  firstThirdNotes: "",
  middleThirdNotes: "",
  finalThirdNotes: "",
  tinNotes: "",
  yearBlended: "",
  prepNotes: ""
};

export const defaultPipeRatings: PipeRatings = {
  flavor: 0,
  strength: 0,
  roomNote: 0,
  performance: 0,
  enjoyment: 0,
  tin: 0,
  mechanics: 0
};
