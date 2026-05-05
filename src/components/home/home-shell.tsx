"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CatalogAutocompleteField } from "@/components/home/catalog-autocomplete-field";
import { appConfig } from "@/lib/app-config";
import { backendConfig } from "@/lib/backend-config";
import { emptyCollectionState, hasCollectionData, type CollectionBottleItem, type CollectionCigarItem, type CollectionPipeItem, type CollectionState, type CollectionTobaccoItem } from "@/lib/collection";
import {
  type CatalogItem,
  type CigarMetadata,
  type PipeMetadata,
  type PipeTobaccoMetadata,
  type SpiritMetadata,
  type CatalogStore,
  type CatalogSuggestion
} from "@/lib/catalog";
import { defaultCigarForm, defaultCigarRatings, type CigarEntry, type CigarFormState, type CigarRatings } from "@/lib/cigar-journal";
import { browserPipeJournalRepository } from "@/lib/data/pipe-journal-repository";
import { homeFilters, homeSorts } from "@/lib/domain";
import {
  defaultPipeForm,
  defaultPipeRatings,
  type EntryMode,
  type PipeEntry,
  type PipeFormState,
  type PipeRatings
} from "@/lib/pipe-journal";
import { defaultSpiritForm, type SpiritDraftState, type SpiritEntry, type SpiritFormState } from "@/lib/spirit-journal";
import {
  clearRemotePipeDraft,
  fetchRemotePipeDraft,
  saveRemotePipeDraft
} from "@/lib/services/remote/pipe-entry-service";
import { fetchRemoteJournalEntries, saveRemoteJournalEntries } from "@/lib/services/remote/journal-entry-service";
import { fetchRemoteUserCatalog, saveRemoteUserCatalog } from "@/lib/services/remote/catalog-service";
import { fetchRemoteCollectionState, saveRemoteCollectionState } from "@/lib/services/remote/collection-service";
import { appServices } from "@/lib/services/service-factory";
import { getAuthCallbackUrl } from "@/lib/site-url";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";

type View = "home" | "collection" | "collectionForm" | "collectionDetail" | "picker" | "form" | "detail" | "profile";
type Category = "cigar" | "pipe" | "spirits";
type JournalEntry = PipeEntry | CigarEntry | SpiritEntry;
type CollectionTab = "humidor" | "cellar" | "bar";
type CollectionFormKind = "cigar" | "tobacco" | "pipe" | "bottle";
type CollectionDetailKind = CollectionFormKind;

type CollectionWishlistKind = "cigar" | "pipe" | "bottle";
type SocialAuthProvider = "google" | "apple" | "facebook";

function createJournalEntryId() {
  return crypto.randomUUID();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function ensureCloudSafeEntryIds<T extends JournalEntry>(entries: T[]) {
  return entries.map((entry) => (isUuid(entry.id) ? entry : { ...entry, id: createJournalEntryId() }));
}

function mergeEntriesById<T extends JournalEntry>(remoteEntries: T[], localEntries: T[]) {
  const seenIds = new Set(remoteEntries.map((entry) => entry.id));

  return [...remoteEntries, ...localEntries.filter((entry) => !seenIds.has(entry.id))].sort((a, b) =>
    (b.date || b.createdAt).localeCompare(a.date || a.createdAt)
  );
}

const socialAuthProviders: Array<{
  provider: SocialAuthProvider;
  label: string;
  mark: string;
}> = [
  { provider: "google", label: "Continue with Google", mark: "G" },
  { provider: "apple", label: "Continue with Apple", mark: "A" },
  { provider: "facebook", label: "Continue with Facebook", mark: "f" }
];

function getProfileAuthRedirectUrl() {
  const fallbackOrigin = "http://localhost:3000";
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = currentOrigin ? `${currentOrigin}/auth/callback` : getAuthCallbackUrl() || `${fallbackOrigin}/auth/callback`;
  const redirectUrl = new URL(callbackUrl, fallbackOrigin);

  redirectUrl.searchParams.set("next", "/?auth=profile");

  return redirectUrl.toString();
}

const pickerItems: Array<{
  key: Category;
  label: string;
  sub: string;
  image: string;
  title: string;
}> = [
  {
    key: "cigar",
    label: "Cigar",
    sub: "Premium cigars & sessions",
    image: "/cigar.png",
    title: "New Cigar Session"
  },
  {
    key: "pipe",
    label: "Pipe",
    sub: "Blends, bowls & tasting notes",
    image: "/pipe.png",
    title: "New Pipe Session"
  },
  {
    key: "spirits",
    label: "Spirits",
    sub: "Whiskey, bourbon & beyond",
    image: "/whiskey.png",
    title: "New Spirits Session"
  }
];

const cigarFlavorFamilies = [
  "Cedar",
  "Oak",
  "Leather",
  "Earth",
  "Pepper",
  "Cinnamon",
  "Nutmeg",
  "Clove",
  "Coffee",
  "Espresso",
  "Cocoa",
  "Dark Chocolate",
  "Cream",
  "Caramel",
  "Molasses",
  "Honey",
  "Vanilla",
  "Toast",
  "Almond",
  "Cashew",
  "Hay",
  "Floral",
  "Citrus",
  "Cherry",
  "Dried Fruit",
  "Raisin",
  "Sweetness",
  "Mineral"
];

const cigarStrengthOptions = ["Mellow", "Mild", "Medium", "Med-Bold", "Bold"] as const;
const spiritTypeOptions = [
  "Bourbon",
  "Rye",
  "American Whiskey",
  "Scotch",
  "Irish Whiskey",
  "Japanese Whisky",
  "Canadian Whisky",
  "Rum",
  "Tequila",
  "Mezcal",
  "Gin",
  "Vodka",
  "Brandy / Cognac",
  "Liqueur",
  "Other"
] as const;
const spiritDrinkStyleOptions = ["Neat", "Rocks", "Splash", "Cocktail"] as const;
const spiritBuyAgainOptions = ["Yes", "Maybe", "No"] as const;
const spiritQuickTagOptions = ["Sweet", "Spicy", "Smoky", "Oak", "Harsh", "Smooth", "Dessert", "Daily Pour"] as const;
const spiritColorOptions = ["Clear", "Straw", "Gold", "Copper", "Tawny", "Mahogany", "Old Oak"] as const;
const spiritClarityOptions = ["Clear", "Hazy", "Opaque"] as const;
const spiritLegsOptions = ["Thick / Slow", "Semi-slow", "Thin / Fast"] as const;
const spiritBeadingOptions = ["Clings to glass", "Lingers", "None"] as const;
const spiritGlassOptions = ["Tumbler", "Glencairn", "Tulip", "Copita", "Neat Glass"] as const;
const spiritAromaComplexityOptions = ["Low", "Medium", "High"] as const;
const spiritPalateSweetnessOptions = ["Dry", "Medium", "Sweet"] as const;
const spiritPalateTextureOptions = ["Harsh", "Medium", "Smooth"] as const;
const spiritPalateBodyOptions = ["Light", "Medium", "Full-bodied"] as const;
const spiritFinishLengthOptions = ["Short", "Medium", "Long"] as const;
const spiritFlavorOptions = [
  "Woody",
  "Smoky",
  "Spicy",
  "Herbal",
  "Winey",
  "Nutty",
  "Malty",
  "Caramel",
  "Floral",
  "Grassy",
  "Astringent",
  "Leather",
  "Fruity",
  "Honey",
  "Peaty",
  "Sulphuric",
  "Vanilla",
  "Citrus",
  "Dried Fruit",
  "Chocolate",
  "Oak"
] as const;

const collectionTabs: Array<{
  key: CollectionTab;
  tabLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  sections: Array<{
    title: string;
    emptyCopy: string;
    actionLabel: string;
    actionCategory: Category;
    actionKind?: CollectionFormKind;
  }>;
}> = [
  {
    key: "humidor",
    tabLabel: "The Humidor",
    heroTitle: "The Humidor",
    heroSubtitle: "Cigars in your rotation",
    heroImage: "/MyHumidor2.png",
    sections: [
      {
        title: "My Cigars",
        emptyCopy: "Nothing in the humidor yet.",
        actionLabel: "Add a Cigar",
        actionCategory: "cigar",
        actionKind: "cigar"
      },
      {
        title: "Want to Try",
        emptyCopy: "No cigars on your radar yet.",
        actionLabel: "Add to Wishlist",
        actionCategory: "cigar"
      }
    ]
  },
  {
    key: "cellar",
    tabLabel: "The Cellar",
    heroTitle: "The Cellar",
    heroSubtitle: "Your tobacco collection & pipes",
    heroImage: "/MyCellar2.png",
    sections: [
      {
        title: "My Tobacco",
        emptyCopy: "Your cellar is empty. Time to stock up.",
        actionLabel: "Add a Tobacco",
        actionCategory: "pipe",
        actionKind: "tobacco"
      },
      {
        title: "My Pipes",
        emptyCopy: "No pipes in the rack yet.",
        actionLabel: "Add a Pipe",
        actionCategory: "pipe",
        actionKind: "pipe"
      },
      {
        title: "Want to Try",
        emptyCopy: "Nothing on your cellar wishlist yet.",
        actionLabel: "Add to Wishlist",
        actionCategory: "pipe"
      }
    ]
  },
  {
    key: "bar",
    tabLabel: "The Bar",
    heroTitle: "The Bar",
    heroSubtitle: "Bottles open, sealed & on deck",
    heroImage: "/MyBar2.png",
    sections: [
      {
        title: "My Bottles",
        emptyCopy: "The bar is dry. Time to restock.",
        actionLabel: "Add a Bottle",
        actionCategory: "spirits",
        actionKind: "bottle"
      },
      {
        title: "Want to Try",
        emptyCopy: "No bottles on deck yet.",
        actionLabel: "Add to Wishlist",
        actionCategory: "spirits"
      }
    ]
  }
];

const COLLECTION_CIGARS_KEY = "finders-log.collection.cigars";
const COLLECTION_TOBACCOS_KEY = "finders-log.collection.tobaccos";
const COLLECTION_PIPES_KEY = "finders-log.collection.pipes";
const COLLECTION_BOTTLES_KEY = "finders-log.collection.bottles";
const COLLECTION_WISHLIST_CIGARS_KEY = "finders-log.collection.wishlist.cigars";
const COLLECTION_WISHLIST_PIPES_KEY = "finders-log.collection.wishlist.pipes";
const COLLECTION_WISHLIST_BOTTLES_KEY = "finders-log.collection.wishlist.bottles";
const collectionCigarVitolaOptions = ["Robusto", "Toro", "Churchill", "Corona", "Gordo", "Petit Corona", "Lancero"] as const;
const collectionCigarFormatOptions = ["Single", "5-Pack", "Box", "Bundle"] as const;
const collectionCigarWrapperShadeOptions = ["Claro", "Natural", "Colorado", "Maduro", "Oscuro"] as const;
const collectionCigarStatusOptions = ["Resting", "Ready to Smoke", "Aging", "Gone"] as const;
const collectionTobaccoStyleOptions = ["Virginia", "VaPer", "English", "Balkan", "Aromatic", "Burley", "Oriental", "Lakeland", "Other"] as const;
const collectionTobaccoCutOptions = ["Ribbon", "Flake", "Broken Flake", "Coin", "Plug", "Ready Rubbed", "Shag", "Crumble Cake", "Other"] as const;
const collectionTobaccoStorageOptions = ["Sealed Tin", "Mason Jar", "Vacuum Sealed", "Bulk Bag", "Other"] as const;
const collectionTobaccoNicotineOptions = ["Mild", "Medium", "Full"] as const;
const collectionTobaccoRoomNoteOptions = ["Friendly", "Neutral", "Unpleasant"] as const;
const collectionTobaccoStatusOptions = ["Sealed", "Aging", "In Rotation", "Finished"] as const;
const collectionPipeShapeOptions = ["Billiard", "Bent Billiard", "Dublin", "Apple", "Brandy", "Pot", "Bulldog", "Canadian", "Churchwarden", "Poker", "Rhodesian", "Prince", "Freehand", "Other"] as const;
const collectionPipeMaterialOptions = ["Briar", "Meerschaum", "Corn Cob", "Clay", "Other"] as const;
const collectionPipeFinishOptions = ["Smooth", "Sandblast", "Rusticated", "Carved", "Natural", "Other"] as const;
const collectionPipeStemOptions = ["Vulcanite", "Acrylic", "Cumberland", "Horn", "Bamboo", "Other"] as const;
const collectionPipeStatusOptions = ["Active", "Resting", "Display", "Retired"] as const;
const collectionBottleStatusOptions = ["Sealed", "Open", "Getting Low", "Empty"] as const;

const defaultCollectionCigarForm = {
  brand: "",
  lineName: "",
  vitola: "",
  quantity: "1",
  format: "Single",
  dateAdded: "",
  wrapperShade: "",
  status: "Resting",
  notes: ""
};

const defaultCollectionTobaccoForm = {
  name: "",
  brand: "",
  style: "",
  cut: "",
  tinDate: "",
  quantity: "1",
  storageFormat: "",
  dateAcquired: "",
  source: "",
  nicotine: "",
  roomNote: "",
  status: "Sealed",
  discontinued: false,
  notes: ""
};

const defaultCollectionPipeForm = {
  name: "",
  maker: "",
  shape: "",
  material: "",
  finish: "",
  stem: "",
  status: "Active",
  dateAcquired: "",
  source: "",
  notes: ""
};

const defaultCollectionBottleForm = {
  name: "",
  distillery: "",
  spiritType: "",
  proof: "",
  age: "",
  status: "Sealed",
  notes: ""
};

function safeParseStored<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse stored Finders Log data", error);
    return fallback;
  }
}

function toggleSingleChoice(current: string, option: string) {
  return current === option ? "" : option;
}

function normalizedWeightedScore(fields: Array<[number, number]>) {
  const valid = fields.filter(([value]) => value > 0);
  if (!valid.length) return 0;

  const totalWeight = valid.reduce((sum, [, weight]) => sum + weight, 0);
  const score = valid.reduce((sum, [value, weight]) => sum + (value * weight) / totalWeight, 0);
  return Math.round(score * 10) / 10;
}

  function formatJournalDate(value: string) {
  if (!value) return "";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${month}/${day}/${year}`;
  }

  return value;
}

function favoriteLabel(isFavorite: boolean) {
  return isFavorite ? "Remove from favorites" : "Add to favorites";
}

function hasCatalogData(store: CatalogStore) {
  return store.brands.length > 0 || store.items.length > 0;
}

function hasDraftData(draft: {
  form: PipeFormState;
  timeOfDay: string;
  blendType: string;
  cutType: string;
  nicotineStrength: string;
  components: string[];
  ratings: PipeRatings;
  entryMode: EntryMode;
}) {
  const { form, ratings } = draft;
  return Boolean(
    form.brand.trim() ||
      form.blendName.trim() ||
      form.date.trim() ||
      form.setting.trim() ||
      form.location.trim() ||
      form.pipeUsed.trim() ||
      form.lighterUsed.trim() ||
      form.quickNotes.trim() ||
      form.firstThirdNotes.trim() ||
      form.middleThirdNotes.trim() ||
      form.finalThirdNotes.trim() ||
      form.tinNotes.trim() ||
      form.yearBlended.trim() ||
      form.prepNotes.trim() ||
      draft.timeOfDay !== "Evening" ||
      draft.blendType !== "English" ||
      draft.cutType !== "Ribbon" ||
      draft.nicotineStrength !== "Medium" ||
      draft.entryMode !== "quick" ||
      draft.components.join("|") !== "Latakia|Orientals" ||
      Object.values(ratings).some((value) => value > 0)
  );
}

function hasCigarDraftData(draft: {
  form: CigarFormState;
  timeOfDay: string;
  wrapperShade: string;
  ratings: CigarRatings;
  entryMode: EntryMode;
}) {
  const { form, ratings } = draft;
  return Boolean(
    form.brand.trim() ||
      form.lineName.trim() ||
      form.date.trim() ||
      form.purchaseDate.trim() ||
      form.boughtFrom.trim() ||
      form.price.trim() ||
      form.restTime.trim() ||
      form.setting.trim() ||
      form.location.trim() ||
      form.vitola.trim() ||
      form.cutType.trim() ||
      form.countryFactory.trim() ||
      form.wrapper.trim() ||
      form.binder.trim() ||
      form.filler.trim() ||
      form.strengthBand !== "Medium" ||
      form.flavorNotes.length > 0 ||
      form.quickNotes.trim() ||
      form.firstThirdNotes.trim() ||
      form.middleThirdNotes.trim() ||
      form.finalThirdNotes.trim() ||
      form.pairing.trim() ||
      form.buyAgain.trim() ||
      draft.timeOfDay !== "Evening" ||
      draft.wrapperShade !== "Natural" ||
      draft.entryMode !== "quick" ||
      Object.values(ratings).some((value) => value > 0)
  );
}

function hasSpiritDraftData(draft: SpiritDraftState) {
  const { form } = draft;
  return Boolean(
    form.name.trim() ||
      form.brand.trim() ||
      form.date.trim() ||
      form.timeOfDay !== "Evening" ||
      form.spiritType !== "Bourbon" ||
      form.ageStatement.trim() ||
      form.proof.trim() ||
      form.mashbill.trim() ||
      form.barrelTypeFinish.trim() ||
      form.batchBarrelNumber.trim() ||
      form.color.trim() ||
      form.clarity.trim() ||
      form.legs.trim() ||
      form.beading.trim() ||
      form.glass.trim() ||
      form.aromaComplexity.trim() ||
      form.aromaNotes.trim() ||
      form.palateSweetness.trim() ||
      form.palateTexture.trim() ||
      form.palateBody.trim() ||
      form.palateNotes.trim() ||
      form.flavorNotes.length > 0 ||
      form.finishLength.trim() ||
      form.finishNotes.trim() ||
      form.pricePaid.trim() ||
      form.drinkStyle !== "Neat" ||
      form.overallImpression.trim() ||
      form.buyAgain.trim() ||
      form.quickTags.length > 0 ||
      draft.entryMode !== "quick" ||
      draft.rating > 0
  );
}

function isPipeEntryFull(entry: PipeEntry) {
  return Boolean(
    entry.setting ||
      entry.location ||
      entry.lighterUsed ||
      entry.firstThirdNotes ||
      entry.middleThirdNotes ||
      entry.finalThirdNotes ||
      entry.tinNotes ||
      entry.yearBlended ||
      entry.prepNotes ||
      entry.ratings.tin > 0 ||
      entry.ratings.mechanics > 0
  );
}

function isSpiritEntryFull(entry: SpiritEntry) {
  return Boolean(
    entry.ageStatement ||
      entry.mashbill ||
      entry.barrelTypeFinish ||
      entry.batchBarrelNumber ||
      entry.color ||
      entry.clarity ||
      entry.legs ||
      entry.beading ||
      entry.glass ||
      entry.aromaComplexity ||
      entry.aromaNotes ||
      entry.palateSweetness ||
      entry.palateTexture ||
      entry.palateBody ||
      entry.palateNotes ||
      entry.flavorNotes.length > 0 ||
      entry.finishLength ||
      entry.finishNotes ||
      entry.pricePaid
  );
}

function isCigarEntryFull(entry: CigarEntry) {
  return Boolean(
    entry.purchaseDate ||
      entry.boughtFrom ||
      entry.price ||
      entry.restTime ||
      entry.setting ||
      entry.location ||
      entry.cutType ||
      entry.countryFactory ||
      entry.wrapper ||
      entry.binder ||
      entry.filler ||
      entry.strengthBand !== "Medium" ||
      entry.flavorNotes.length > 0 ||
      entry.firstThirdNotes ||
      entry.middleThirdNotes ||
      entry.finalThirdNotes ||
      entry.pairing ||
      entry.buyAgain ||
      entry.ratings.construction > 0
  );
}

function getEntryDisplayTitle(entry: JournalEntry) {
  if (entry.category === "pipe") return entry.blendName;
  if (entry.category === "cigar") return entry.lineName;
  return entry.name;
}

function getEntryDisplayBrand(entry: JournalEntry) {
  return entry.brand || (entry.category === "pipe" ? "Pipe Journal" : entry.category === "cigar" ? "Cigar Journal" : "Spirits Journal");
}

function getEntryMetaLine(entry: JournalEntry) {
  const parts = [formatJournalDate(entry.date) || "No date"];
  if (entry.category === "pipe" || entry.category === "cigar") {
    if (entry.timeOfDay) parts.push(entry.timeOfDay);
  }
  if (entry.brand) parts.push(entry.brand);
  return parts.join(" · ");
}

function getEntrySearchText(entry: JournalEntry) {
  if (entry.category === "pipe") {
    return [
      entry.brand,
      entry.blendName,
      entry.quickNotes,
      entry.location,
      entry.setting,
      entry.pipeUsed,
      entry.firstThirdNotes,
      entry.middleThirdNotes,
      entry.finalThirdNotes
    ]
      .join(" ")
      .toLowerCase();
  }

  if (entry.category === "cigar") {
    return [
      entry.brand,
      entry.lineName,
      entry.quickNotes,
      entry.location,
      entry.setting,
      entry.vitola,
      entry.countryFactory,
      entry.wrapper,
      entry.binder,
      entry.filler,
      entry.firstThirdNotes,
      entry.middleThirdNotes,
      entry.finalThirdNotes,
      entry.pairing
    ]
      .join(" ")
      .toLowerCase();
  }

  return [
    entry.brand,
    entry.name,
    entry.spiritType,
    entry.proof,
    entry.drinkStyle,
    entry.pricePaid,
    entry.overallImpression,
    entry.buyAgain,
    ...entry.quickTags
  ]
    .join(" ")
    .toLowerCase();
}

function cigarStrengthIndex(value: string) {
  const index = cigarStrengthOptions.indexOf(value as (typeof cigarStrengthOptions)[number]);
  return index >= 0 ? index : 2;
}

function formatSpiritProof(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/[a-z%]/i.test(trimmed)) return trimmed;
  return `${trimmed} proof`;
}

function getSpiritRatingLabel(value: number) {
  if (value >= 9) return "Top Shelf";
  if (value >= 7) return "Keeper";
  if (value >= 5) return "Solid Pour";
  if (value >= 3) return "Occasional Sip";
  if (value > 0) return "Pass";
  return "Not Rated";
}

export function HomeShell() {
  const { catalogService, pipeEntryService } = appServices;
  const isSupabaseMode = backendConfig.currentDataProvider === "supabase";
  const canShowProfileAuth = Boolean(backendConfig.supabaseUrl);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("newest");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<View>("home");
  const [collectionTab, setCollectionTab] = useState<CollectionTab>("humidor");
  const [collectionFormKind, setCollectionFormKind] = useState<CollectionFormKind>("cigar");
  const [selectedCategory, setSelectedCategory] = useState<Category>("cigar");
  const [entryMode, setEntryMode] = useState<EntryMode>("quick");
  const [pipeTimeOfDay, setPipeTimeOfDay] = useState("Evening");
  const [pipeBlendType, setPipeBlendType] = useState("English");
  const [pipeCutType, setPipeCutType] = useState("Ribbon");
  const [pipeNicotineStrength, setPipeNicotineStrength] = useState("Medium");
  const [pipeComponents, setPipeComponents] = useState<string[]>(["Latakia", "Orientals"]);
  const [pipeForm, setPipeForm] = useState<PipeFormState>(defaultPipeForm);
  const [cigarTimeOfDay, setCigarTimeOfDay] = useState("Evening");
  const [cigarWrapperShade, setCigarWrapperShade] = useState("Natural");
  const [cigarForm, setCigarForm] = useState<CigarFormState>(defaultCigarForm);
  const [pipeEntries, setPipeEntries] = useState<PipeEntry[]>([]);
  const [cigarEntries, setCigarEntries] = useState<CigarEntry[]>([]);
  const [spiritEntries, setSpiritEntries] = useState<SpiritEntry[]>([]);
  const [collectionCigars, setCollectionCigars] = useState<CollectionCigarItem[]>([]);
  const [collectionTobaccos, setCollectionTobaccos] = useState<CollectionTobaccoItem[]>([]);
  const [collectionPipes, setCollectionPipes] = useState<CollectionPipeItem[]>([]);
  const [collectionBottles, setCollectionBottles] = useState<CollectionBottleItem[]>([]);
  const [collectionWishlistCigars, setCollectionWishlistCigars] = useState<string[]>([]);
  const [collectionWishlistPipes, setCollectionWishlistPipes] = useState<string[]>([]);
  const [collectionWishlistBottles, setCollectionWishlistBottles] = useState<string[]>([]);
  const [collectionWishlistInput, setCollectionWishlistInput] = useState("");
  const [collectionCigarForm, setCollectionCigarForm] = useState(defaultCollectionCigarForm);
  const [collectionTobaccoForm, setCollectionTobaccoForm] = useState(defaultCollectionTobaccoForm);
  const [collectionPipeForm, setCollectionPipeForm] = useState(defaultCollectionPipeForm);
  const [collectionBottleForm, setCollectionBottleForm] = useState(defaultCollectionBottleForm);
  const [selectedCollectionDetailKind, setSelectedCollectionDetailKind] = useState<CollectionDetailKind>("cigar");
  const [selectedCollectionDetailId, setSelectedCollectionDetailId] = useState<string | null>(null);
  const [editingCollectionCigarId, setEditingCollectionCigarId] = useState<string | null>(null);
  const [editingCollectionTobaccoId, setEditingCollectionTobaccoId] = useState<string | null>(null);
  const [editingCollectionPipeId, setEditingCollectionPipeId] = useState<string | null>(null);
  const [editingCollectionBottleId, setEditingCollectionBottleId] = useState<string | null>(null);
  const [selectedPipeEntryId, setSelectedPipeEntryId] = useState<string | null>(null);
  const [selectedCigarEntryId, setSelectedCigarEntryId] = useState<string | null>(null);
  const [selectedSpiritEntryId, setSelectedSpiritEntryId] = useState<string | null>(null);
  const [editingPipeEntryId, setEditingPipeEntryId] = useState<string | null>(null);
  const [editingCigarEntryId, setEditingCigarEntryId] = useState<string | null>(null);
  const [editingSpiritEntryId, setEditingSpiritEntryId] = useState<string | null>(null);
  const [userCatalog, setUserCatalog] = useState<CatalogStore>({ brands: [], items: [] });
  const [pipeRatings, setPipeRatings] = useState<PipeRatings>(defaultPipeRatings);
  const [pipeRatingHover, setPipeRatingHover] = useState<Partial<Record<keyof PipeRatings, number>>>({});
  const [cigarRatings, setCigarRatings] = useState<CigarRatings>(defaultCigarRatings);
  const [cigarRatingHover, setCigarRatingHover] = useState<Partial<Record<keyof CigarRatings, number>>>({});
  const [customCigarFlavor, setCustomCigarFlavor] = useState("");
  const [spiritForm, setSpiritForm] = useState<SpiritFormState>(defaultSpiritForm);
  const [customSpiritFlavor, setCustomSpiritFlavor] = useState("");
  const [spiritRating, setSpiritRating] = useState(0);
  const [spiritRatingHover, setSpiritRatingHover] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [authEmailInput, setAuthEmailInput] = useState("");
  const [authUserEmail, setAuthUserEmail] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const syncTimeoutRef = useRef<number | null>(null);
  const latestLocalStateRef = useRef({
    pipeEntries: [] as PipeEntry[],
    cigarEntries: [] as CigarEntry[],
    spiritEntries: [] as SpiritEntry[],
    userCatalog: { brands: [], items: [] } as CatalogStore,
    collection: emptyCollectionState(),
    draft: {
      form: defaultPipeForm,
      timeOfDay: "Evening",
      blendType: "English",
      cutType: "Ribbon",
      nicotineStrength: "Medium",
      components: ["Latakia", "Orientals"],
      ratings: defaultPipeRatings,
      entryMode: "quick" as EntryMode
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const authTarget = searchParams.get("auth");
    const authError = searchParams.get("auth_error");

    if (authTarget === "profile" || authError) {
      setView("profile");
    }

    if (authError) {
      setAuthNotice(authError);
    }

    if (authTarget || authError) {
      searchParams.delete("auth");
      searchParams.delete("auth_error");
      const cleanQuery = searchParams.toString();
      const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [view, selectedCategory, collectionTab, collectionFormKind, selectedPipeEntryId, selectedCigarEntryId, selectedSpiritEntryId]);

  const activePickerItem = pickerItems.find((item) => item.key === selectedCategory) ?? pickerItems[0];
  const activeCollectionTab = collectionTabs.find((tab) => tab.key === collectionTab) ?? collectionTabs[0];
  const catalogStore = useMemo(() => catalogService.getCatalogStore(userCatalog), [catalogService, userCatalog]);
  const activeCollectionCigarBrand = useMemo(
    () => catalogService.findBrandByExactName(catalogStore, "cigars", collectionCigarForm.brand),
    [catalogService, catalogStore, collectionCigarForm.brand]
  );
  const collectionCigarBrandSuggestions = useMemo(
    () => catalogService.searchBrands(catalogStore, "cigars", collectionCigarForm.brand),
    [catalogService, catalogStore, collectionCigarForm.brand]
  );
  const collectionCigarLineSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "cigars", collectionCigarForm.lineName, {
        brandId: activeCollectionCigarBrand?.id ?? undefined
      }),
    [activeCollectionCigarBrand?.id, catalogService, catalogStore, collectionCigarForm.lineName]
  );
  const activeCollectionTobaccoBrand = useMemo(
    () => catalogService.findBrandByExactName(catalogStore, "pipeTobaccos", collectionTobaccoForm.brand),
    [catalogService, catalogStore, collectionTobaccoForm.brand]
  );
  const collectionTobaccoBrandSuggestions = useMemo(
    () => catalogService.searchBrands(catalogStore, "pipeTobaccos", collectionTobaccoForm.brand),
    [catalogService, catalogStore, collectionTobaccoForm.brand]
  );
  const collectionTobaccoNameSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "pipeTobaccos", collectionTobaccoForm.name, {
        brandId: activeCollectionTobaccoBrand?.id ?? undefined
      }),
    [activeCollectionTobaccoBrand?.id, catalogService, catalogStore, collectionTobaccoForm.name]
  );
  const collectionPipeSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "pipes", collectionPipeForm.name).map((suggestion) => {
        const item = catalogService.getItemById(catalogStore, suggestion.id);
        return item
          ? {
              ...suggestion,
              label: catalogService.getCatalogItemDisplayName(catalogStore, item)
            }
          : suggestion;
      }),
    [catalogService, catalogStore, collectionPipeForm.name]
  );
  const activeCollectionBottleBrand = useMemo(
    () => catalogService.findBrandByExactName(catalogStore, "spirits", collectionBottleForm.distillery),
    [catalogService, catalogStore, collectionBottleForm.distillery]
  );
  const collectionBottleNameSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "spirits", collectionBottleForm.name, {
        brandId: activeCollectionBottleBrand?.id ?? undefined
      }),
    [activeCollectionBottleBrand?.id, catalogService, catalogStore, collectionBottleForm.name]
  );
  const collectionBottleBrandSuggestions = useMemo(
    () => catalogService.searchBrands(catalogStore, "spirits", collectionBottleForm.distillery),
    [catalogService, catalogStore, collectionBottleForm.distillery]
  );
  const selectedCollectionCigar = useMemo(
    () => collectionCigars.find((item) => item.id === selectedCollectionDetailId) ?? null,
    [collectionCigars, selectedCollectionDetailId]
  );
  const selectedCollectionTobacco = useMemo(
    () => collectionTobaccos.find((item) => item.id === selectedCollectionDetailId) ?? null,
    [collectionTobaccos, selectedCollectionDetailId]
  );
  const selectedCollectionPipe = useMemo(
    () => collectionPipes.find((item) => item.id === selectedCollectionDetailId) ?? null,
    [collectionPipes, selectedCollectionDetailId]
  );
  const selectedCollectionBottle = useMemo(
    () => collectionBottles.find((item) => item.id === selectedCollectionDetailId) ?? null,
    [collectionBottles, selectedCollectionDetailId]
  );
  const activePipeBrand = useMemo(
    () => catalogService.findBrandByExactName(catalogStore, "pipeTobaccos", pipeForm.brand),
    [catalogService, catalogStore, pipeForm.brand]
  );
  const activePipeBlend = useMemo(
    () =>
      catalogService.findItemByExactName(
        catalogStore,
        "pipeTobaccos",
        pipeForm.blendName,
        activePipeBrand?.id ?? undefined
      ),
    [activePipeBrand?.id, catalogService, catalogStore, pipeForm.blendName]
  );

  const pipeBrandSuggestions = useMemo(
    () => catalogService.searchBrands(catalogStore, "pipeTobaccos", pipeForm.brand),
    [catalogService, catalogStore, pipeForm.brand]
  );

  const pipeBlendSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "pipeTobaccos", pipeForm.blendName, {
        brandId: activePipeBrand?.id ?? undefined
      }),
    [activePipeBrand?.id, catalogService, catalogStore, pipeForm.blendName]
  );

  const pipeUsedSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "pipes", pipeForm.pipeUsed).map((suggestion) => {
        const item = catalogService.getItemById(catalogStore, suggestion.id);
        return item
          ? {
              ...suggestion,
              label: catalogService.getCatalogItemDisplayName(catalogStore, item)
            }
          : suggestion;
      }),
    [catalogService, catalogStore, pipeForm.pipeUsed]
  );
  const activePipeUsedItem = useMemo(
    () =>
      catalogStore.items.find(
        (item) =>
          item.type === "pipes" &&
          catalogService.getCatalogItemDisplayName(catalogStore, item).toLowerCase() === pipeForm.pipeUsed.trim().toLowerCase()
      ) ?? null,
    [catalogService, catalogStore, pipeForm.pipeUsed]
  );
  const activeCigarBrand = useMemo(
    () => catalogService.findBrandByExactName(catalogStore, "cigars", cigarForm.brand),
    [catalogService, catalogStore, cigarForm.brand]
  );
  const activeCigarLine = useMemo(
    () => catalogService.findItemByExactName(catalogStore, "cigars", cigarForm.lineName, activeCigarBrand?.id ?? undefined),
    [activeCigarBrand?.id, catalogService, catalogStore, cigarForm.lineName]
  );
  const cigarBrandSuggestions = useMemo(
    () => catalogService.searchBrands(catalogStore, "cigars", cigarForm.brand),
    [catalogService, catalogStore, cigarForm.brand]
  );
  const cigarLineSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "cigars", cigarForm.lineName, {
        brandId: activeCigarBrand?.id ?? undefined
      }),
    [activeCigarBrand?.id, catalogService, catalogStore, cigarForm.lineName]
  );
  const cigarFlavorOptions = useMemo(() => {
    const extras = cigarForm.flavorNotes.filter((note) => !cigarFlavorFamilies.includes(note));
    return [...cigarFlavorFamilies, ...extras];
  }, [cigarForm.flavorNotes]);
  const activeSpiritBrand = useMemo(
    () => catalogService.findBrandByExactName(catalogStore, "spirits", spiritForm.brand),
    [catalogService, catalogStore, spiritForm.brand]
  );
  const spiritNameSuggestions = useMemo(
    () =>
      catalogService.searchItems(catalogStore, "spirits", spiritForm.name, {
        brandId: activeSpiritBrand?.id ?? undefined
      }),
    [activeSpiritBrand?.id, catalogService, catalogStore, spiritForm.name]
  );
  const spiritBrandSuggestions = useMemo(
    () => catalogService.searchBrands(catalogStore, "spirits", spiritForm.brand),
    [catalogService, catalogStore, spiritForm.brand]
  );

  const pipeSuggestedScore = useMemo(() => {
    return normalizedWeightedScore([
      [pipeRatings.flavor, 0.28],
      [pipeRatings.enjoyment, 0.22],
      [pipeRatings.performance, 0.18],
      [pipeRatings.roomNote, 0.12],
      [pipeRatings.mechanics, 0.1],
      [pipeRatings.tin, 0.06],
      [pipeRatings.strength, 0.04]
    ]);
  }, [pipeRatings]);
  const cigarSuggestedScore = useMemo(() => {
    return normalizedWeightedScore([
      [cigarRatings.flavor, 0.3],
      [cigarRatings.construction, 0.15],
      [cigarRatings.draw, 0.15],
      [cigarRatings.burn, 0.15],
      [cigarRatings.aroma, 0.1],
      [cigarRatings.strength, 0.05],
      [cigarRatings.enjoyment, 0.1]
    ]);
  }, [cigarRatings]);
  const selectedPipeEntry = useMemo(
    () => pipeEntries.find((entry) => entry.id === selectedPipeEntryId) ?? null,
    [pipeEntries, selectedPipeEntryId]
  );
  const selectedCigarEntry = useMemo(
    () => cigarEntries.find((entry) => entry.id === selectedCigarEntryId) ?? null,
    [cigarEntries, selectedCigarEntryId]
  );
  const selectedSpiritEntry = useMemo(
    () => spiritEntries.find((entry) => entry.id === selectedSpiritEntryId) ?? null,
    [selectedSpiritEntryId, spiritEntries]
  );
  const isEditingPipeEntry = editingPipeEntryId !== null;
  const isEditingCigarEntry = editingCigarEntryId !== null;
  const isEditingSpiritEntry = editingSpiritEntryId !== null;
  const selectedPipeEntryIsFull = selectedPipeEntry ? (selectedPipeEntry.entryMode ? selectedPipeEntry.entryMode === "full" : isPipeEntryFull(selectedPipeEntry)) : false;
  const selectedCigarEntryIsFull = selectedCigarEntry ? (selectedCigarEntry.entryMode ? selectedCigarEntry.entryMode === "full" : isCigarEntryFull(selectedCigarEntry)) : false;
  const selectedSpiritEntryIsFull = selectedSpiritEntry ? (selectedSpiritEntry.entryMode ? selectedSpiritEntry.entryMode === "full" : isSpiritEntryFull(selectedSpiritEntry)) : false;
  const journalEntryCount = pipeEntries.length + cigarEntries.length + spiritEntries.length;
  const favoriteCount = useMemo(
    () => [...pipeEntries, ...cigarEntries, ...spiritEntries].filter((entry) => entry.isFavorite).length,
    [cigarEntries, pipeEntries, spiritEntries]
  );
  const personalCatalogCount = useMemo(
    () => userCatalog.brands.length + userCatalog.items.length,
    [userCatalog.brands.length, userCatalog.items.length]
  );

  function applyDraftState(draft: {
    form: PipeFormState;
    timeOfDay: string;
    blendType: string;
    cutType: string;
    nicotineStrength: string;
    components: string[];
    ratings: PipeRatings;
    entryMode: EntryMode;
  }) {
    setPipeForm({ ...defaultPipeForm, ...draft.form });
    setPipeTimeOfDay(draft.timeOfDay || "Evening");
    setPipeBlendType(draft.blendType || "English");
    setPipeCutType(draft.cutType || "Ribbon");
    setPipeNicotineStrength(draft.nicotineStrength || "Medium");
    setPipeComponents(draft.components?.length ? draft.components : ["Latakia", "Orientals"]);
    setPipeRatings({ ...defaultPipeRatings, ...draft.ratings });
    setEntryMode(draft.entryMode || "quick");
  }

  function applyCigarDraftState(draft: {
    form: CigarFormState;
    timeOfDay: string;
    wrapperShade: string;
    ratings: CigarRatings;
    entryMode: EntryMode;
  }) {
    setCigarForm({ ...defaultCigarForm, ...draft.form });
    setCigarTimeOfDay(draft.timeOfDay || "Evening");
    setCigarWrapperShade(draft.wrapperShade || "Natural");
    setCigarRatings({ ...defaultCigarRatings, ...draft.ratings });
    setEntryMode(draft.entryMode || "quick");
  }

  function applySpiritDraftState(draft: SpiritDraftState) {
    setSpiritForm({ ...defaultSpiritForm, ...draft.form });
    setSpiritRating(draft.rating || 0);
    setSpiritRatingHover(0);
    setEntryMode(draft.entryMode || "quick");
  }

  function applyPipeEntryToForm(entry: PipeEntry) {
    setPipeForm({
      brand: entry.brand,
      blendName: entry.blendName,
      date: entry.date,
      setting: entry.setting,
      location: entry.location,
      pipeUsed: entry.pipeUsed,
      lighterUsed: entry.lighterUsed,
      quickNotes: entry.quickNotes,
      firstThirdNotes: entry.firstThirdNotes,
      middleThirdNotes: entry.middleThirdNotes,
      finalThirdNotes: entry.finalThirdNotes,
      tinNotes: entry.tinNotes,
      yearBlended: entry.yearBlended,
      prepNotes: entry.prepNotes
    });
    setPipeTimeOfDay(entry.timeOfDay || "Evening");
    setPipeBlendType(entry.blendType || "English");
    setPipeCutType(entry.cutType || "Ribbon");
    setPipeNicotineStrength(entry.nicotineStrength || "Medium");
    setPipeComponents(entry.components.length ? entry.components : ["Latakia", "Orientals"]);
    setPipeRatings({ ...defaultPipeRatings, ...entry.ratings });
    setEntryMode(
      entry.entryMode ||
      (entry.firstThirdNotes ||
        entry.middleThirdNotes ||
        entry.finalThirdNotes ||
        entry.tinNotes ||
        entry.yearBlended ||
        entry.prepNotes ||
        entry.lighterUsed ||
        entry.setting ||
        entry.location ||
        entry.ratings.tin > 0 ||
        entry.ratings.mechanics > 0
        ? "full"
        : "quick")
    );
  }

  function applyCigarEntryToForm(entry: CigarEntry) {
    setCigarForm({
      brand: entry.brand,
      lineName: entry.lineName,
      date: entry.date,
      purchaseDate: entry.purchaseDate,
      boughtFrom: entry.boughtFrom,
      price: entry.price,
      restTime: entry.restTime,
      setting: entry.setting,
      location: entry.location,
      vitola: entry.vitola,
      cutType: entry.cutType,
      countryFactory: entry.countryFactory,
      wrapper: entry.wrapper,
      binder: entry.binder,
      filler: entry.filler,
      strengthBand: entry.strengthBand || "Medium",
      flavorNotes: entry.flavorNotes || [],
      quickNotes: entry.quickNotes,
      firstThirdNotes: entry.firstThirdNotes,
      middleThirdNotes: entry.middleThirdNotes,
      finalThirdNotes: entry.finalThirdNotes,
      pairing: entry.pairing,
      buyAgain: entry.buyAgain
    });
    setCigarTimeOfDay(entry.timeOfDay || "Evening");
    setCigarWrapperShade("Natural");
    setCigarRatings({ ...defaultCigarRatings, ...entry.ratings });
    setEntryMode(entry.entryMode || (isCigarEntryFull(entry) ? "full" : "quick"));
  }

  function applySpiritEntryToForm(entry: SpiritEntry) {
    setSpiritForm({
      name: entry.name,
      brand: entry.brand,
      date: entry.date,
      timeOfDay: entry.timeOfDay || "Evening",
      spiritType: entry.spiritType,
      ageStatement: entry.ageStatement || "",
      proof: entry.proof,
      mashbill: entry.mashbill || "",
      barrelTypeFinish: entry.barrelTypeFinish || "",
      batchBarrelNumber: entry.batchBarrelNumber || "",
      color: entry.color || "",
      clarity: entry.clarity || "",
      legs: entry.legs || "",
      beading: entry.beading || "",
      glass: entry.glass || "",
      aromaComplexity: entry.aromaComplexity || "",
      aromaNotes: entry.aromaNotes || "",
      palateSweetness: entry.palateSweetness || "",
      palateTexture: entry.palateTexture || "",
      palateBody: entry.palateBody || "",
      palateNotes: entry.palateNotes || "",
      flavorNotes: entry.flavorNotes || [],
      finishLength: entry.finishLength || "",
      finishNotes: entry.finishNotes || "",
      pricePaid: entry.pricePaid,
      drinkStyle: entry.drinkStyle,
      overallImpression: entry.overallImpression,
      buyAgain: entry.buyAgain,
      quickTags: entry.quickTags
    });
    setSpiritRating(entry.rating);
    setSpiritRatingHover(0);
    setEntryMode(entry.entryMode || (isSpiritEntryFull(entry) ? "full" : "quick"));
  }

  useEffect(() => {
    setIsHydrated(true);

    try {
      setPipeEntries(ensureCloudSafeEntryIds(pipeEntryService.loadEntries()));
    } catch (error) {
      console.error("Failed to load saved pipe entries", error);
    }

    try {
      setCigarEntries(ensureCloudSafeEntryIds(browserPipeJournalRepository.loadCigarEntries()));
    } catch (error) {
      console.error("Failed to load saved cigar entries", error);
    }

    try {
      setSpiritEntries(ensureCloudSafeEntryIds(browserPipeJournalRepository.loadSpiritEntries()));
    } catch (error) {
      console.error("Failed to load saved spirit entries", error);
    }

    try {
      const draft = pipeEntryService.loadDraft();
      if (draft) {
        applyDraftState(draft);
      }
    } catch (error) {
      console.error("Failed to load pipe draft", error);
    }

    try {
      const cigarDraft = browserPipeJournalRepository.loadCigarDraft();
      if (cigarDraft) {
        applyCigarDraftState(cigarDraft);
      }
    } catch (error) {
      console.error("Failed to load cigar draft", error);
    }

    try {
      const spiritDraft = browserPipeJournalRepository.loadSpiritDraft();
      if (spiritDraft) {
        applySpiritDraftState(spiritDraft);
      }
    } catch (error) {
      console.error("Failed to load spirit draft", error);
    }

    try {
      setUserCatalog(catalogService.loadUserCatalog());
    } catch (error) {
      console.error("Failed to load user catalog", error);
    }

    try {
      setCollectionCigars(safeParseStored<CollectionCigarItem[]>(window.localStorage.getItem(COLLECTION_CIGARS_KEY), []));
    } catch (error) {
      console.error("Failed to load collection cigars", error);
    }

    try {
      setCollectionTobaccos(safeParseStored<CollectionTobaccoItem[]>(window.localStorage.getItem(COLLECTION_TOBACCOS_KEY), []));
    } catch (error) {
      console.error("Failed to load collection tobaccos", error);
    }

    try {
      setCollectionPipes(safeParseStored<CollectionPipeItem[]>(window.localStorage.getItem(COLLECTION_PIPES_KEY), []));
    } catch (error) {
      console.error("Failed to load collection pipes", error);
    }

    try {
      setCollectionBottles(safeParseStored<CollectionBottleItem[]>(window.localStorage.getItem(COLLECTION_BOTTLES_KEY), []));
    } catch (error) {
      console.error("Failed to load collection bottles", error);
    }

    try {
      setCollectionWishlistCigars(safeParseStored<string[]>(window.localStorage.getItem(COLLECTION_WISHLIST_CIGARS_KEY), []));
    } catch (error) {
      console.error("Failed to load cigar wishlist", error);
    }

    try {
      setCollectionWishlistPipes(safeParseStored<string[]>(window.localStorage.getItem(COLLECTION_WISHLIST_PIPES_KEY), []));
    } catch (error) {
      console.error("Failed to load pipe wishlist", error);
    }

    try {
      setCollectionWishlistBottles(safeParseStored<string[]>(window.localStorage.getItem(COLLECTION_WISHLIST_BOTTLES_KEY), []));
    } catch (error) {
      console.error("Failed to load bottle wishlist", error);
    }
  }, [catalogService, pipeEntryService]);

  useEffect(() => {
    if (!isSupabaseMode) return;

    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    async function refreshUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (cancelled) return;

      setAuthUserId(user?.id ?? null);
      setAuthUserEmail(user?.email ?? null);
      if (user?.email) {
        setAuthEmailInput(user.email);
      }
    }

    void refreshUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;

      setAuthUserId(session?.user?.id ?? null);
      setAuthUserEmail(session?.user?.email ?? null);
      setRemoteReady(false);

      if (!session?.user) {
        setSyncNotice("Create your profile when you're ready to save your journal across devices.");
      } else {
        setSyncNotice("Profile connected. Pulling in your saved journal...");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isSupabaseMode]);

  useEffect(() => {
    latestLocalStateRef.current = {
      pipeEntries,
      cigarEntries,
      spiritEntries,
      userCatalog,
      collection: {
        cigars: collectionCigars,
        tobaccos: collectionTobaccos,
        pipes: collectionPipes,
        bottles: collectionBottles,
        wishlistCigars: collectionWishlistCigars,
        wishlistPipes: collectionWishlistPipes,
        wishlistBottles: collectionWishlistBottles
      },
      draft: {
        form: pipeForm,
        timeOfDay: pipeTimeOfDay,
        blendType: pipeBlendType,
        cutType: pipeCutType,
        nicotineStrength: pipeNicotineStrength,
        components: pipeComponents,
        ratings: pipeRatings,
        entryMode
      }
    };
  }, [cigarEntries, collectionBottles, collectionCigars, collectionPipes, collectionTobaccos, collectionWishlistBottles, collectionWishlistCigars, collectionWishlistPipes, entryMode, pipeBlendType, pipeComponents, pipeCutType, pipeEntries, pipeForm, pipeNicotineStrength, pipeRatings, pipeTimeOfDay, spiritEntries, userCatalog]);

  useEffect(() => {
    if (!isSupabaseMode || !isHydrated || !authUserId) return;

    let cancelled = false;
    setSyncNotice("Profile connected. Pulling in your saved journal...");

    async function loadRemoteState() {
      try {
        const [entriesResult, draftResult, catalogResult, collectionResult] = await Promise.allSettled([
          fetchRemoteJournalEntries(),
          fetchRemotePipeDraft(),
          fetchRemoteUserCatalog(),
          fetchRemoteCollectionState()
        ]);

        const remoteEntries = entriesResult.status === "fulfilled" ? entriesResult.value : [];
        const remotePipeEntries = remoteEntries.filter((entry): entry is PipeEntry => entry.category === "pipe");
        const remoteCigarEntries = remoteEntries.filter((entry): entry is CigarEntry => entry.category === "cigar");
        const remoteSpiritEntries = remoteEntries.filter((entry): entry is SpiritEntry => entry.category === "spirits");
        const remoteDraft = draftResult.status === "fulfilled" ? draftResult.value : null;
        const remoteUserCatalog =
          catalogResult.status === "fulfilled" ? catalogResult.value : { brands: [], items: [] };
        const remoteCollection =
          collectionResult.status === "fulfilled" ? collectionResult.value : emptyCollectionState();

        if (cancelled) return;

        const localState = latestLocalStateRef.current;
        const remoteHasEntries = remoteEntries.length > 0;
        const remoteHasDraft = Boolean(remoteDraft);
        const remoteHasCatalog = hasCatalogData(remoteUserCatalog);
        const remoteHasCollection = hasCollectionData(remoteCollection);
        const localHasEntries =
          localState.pipeEntries.length > 0 || localState.cigarEntries.length > 0 || localState.spiritEntries.length > 0;
        const localHasDraft = hasDraftData(localState.draft);
        const localHasCatalog = hasCatalogData(localState.userCatalog);
        const localHasCollection = hasCollectionData(localState.collection);
        const remoteHasAnyData = remoteHasEntries || remoteHasDraft || remoteHasCatalog || remoteHasCollection;
        const localHasAnyData = localHasEntries || localHasDraft || localHasCatalog || localHasCollection;

        if (remoteHasEntries || localHasEntries) {
          const mergedPipeEntries = mergeEntriesById(remotePipeEntries, localState.pipeEntries);
          const mergedCigarEntries = mergeEntriesById(remoteCigarEntries, localState.cigarEntries);
          const mergedSpiritEntries = mergeEntriesById(remoteSpiritEntries, localState.spiritEntries);
          const mergedEntries = [...mergedPipeEntries, ...mergedCigarEntries, ...mergedSpiritEntries];

          setPipeEntries(mergedPipeEntries);
          setCigarEntries(mergedCigarEntries);
          setSpiritEntries(mergedSpiritEntries);

          if (localHasEntries) {
            await saveRemoteJournalEntries(mergedEntries);
          }
        } else if (!localHasEntries) {
          setPipeEntries([]);
          setCigarEntries([]);
          setSpiritEntries([]);
        }

        if (remoteDraft) {
          applyDraftState(remoteDraft);
        } else if (!localHasDraft) {
          applyDraftState({
            form: defaultPipeForm,
            timeOfDay: "Evening",
            blendType: "English",
            cutType: "Ribbon",
            nicotineStrength: "Medium",
            components: ["Latakia", "Orientals"],
            ratings: defaultPipeRatings,
            entryMode: "quick"
          });
        }

        if (remoteHasCatalog) {
          setUserCatalog(remoteUserCatalog);
        } else if (!localHasCatalog) {
          setUserCatalog({ brands: [], items: [] });
        }

        if (remoteHasCollection) {
          setCollectionCigars(remoteCollection.cigars);
          setCollectionTobaccos(remoteCollection.tobaccos);
          setCollectionPipes(remoteCollection.pipes);
          setCollectionBottles(remoteCollection.bottles);
          setCollectionWishlistCigars(remoteCollection.wishlistCigars);
          setCollectionWishlistPipes(remoteCollection.wishlistPipes);
          setCollectionWishlistBottles(remoteCollection.wishlistBottles);
        } else if (!localHasCollection) {
          const emptyState = emptyCollectionState();
          setCollectionCigars(emptyState.cigars);
          setCollectionTobaccos(emptyState.tobaccos);
          setCollectionPipes(emptyState.pipes);
          setCollectionBottles(emptyState.bottles);
          setCollectionWishlistCigars(emptyState.wishlistCigars);
          setCollectionWishlistPipes(emptyState.wishlistPipes);
          setCollectionWishlistBottles(emptyState.wishlistBottles);
        }

        const syncFailures = [
          entriesResult.status === "rejected" ? "journal entries" : null,
          draftResult.status === "rejected" ? "drafts" : null,
          catalogResult.status === "rejected" ? "personal catalog" : null,
          collectionResult.status === "rejected" ? "collection" : null
        ].filter((value): value is string => Boolean(value));

        setRemoteReady(true);
        if (syncFailures.length) {
          setSyncNotice(`Your profile is connected. I still need to finish syncing: ${syncFailures.join(", ")}.`);
        } else if (remoteHasAnyData) {
          setSyncNotice("Your profile is connected. This journal can now follow you across devices.");
        } else if (localHasAnyData) {
          setSyncNotice("Your profile is connected. Your current journal is ready to back up.");
        } else {
          setSyncNotice("Your profile is ready. This journal can start saving across devices.");
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load remote Supabase state", error);
        setRemoteReady(false);
        setSyncNotice("Your profile is connected, but I couldn't load your saved journal yet.");
      }
    }

    void loadRemoteState();

    return () => {
      cancelled = true;
    };
  }, [authUserId, isHydrated, isSupabaseMode]);

  useEffect(() => {
    if (!isHydrated) return;

    const draft = {
      form: pipeForm,
      timeOfDay: pipeTimeOfDay,
      blendType: pipeBlendType,
      cutType: pipeCutType,
      nicotineStrength: pipeNicotineStrength,
      components: pipeComponents,
      ratings: pipeRatings,
      entryMode
    };

    try {
      pipeEntryService.saveDraft(draft);
    } catch (error) {
      console.error("Failed to save pipe draft", error);
    }

    if (!isSupabaseMode || !authUserId || !remoteReady) return;
    const draftHasMeaningfulData = hasDraftData(draft);

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    if (!draftHasMeaningfulData) {
      if (syncNotice === "I couldn't save that draft to your profile yet.") {
        setSyncNotice("Your profile is connected. This journal can now follow you across devices.");
      }
      return;
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      void saveRemotePipeDraft(draft)
        .then(() => setSyncNotice("Draft saved to your profile."))
        .catch((error) => {
          console.error("Failed to save remote pipe draft", error);
          setSyncNotice("I couldn't save that draft to your profile yet.");
        });
    }, 250);
  }, [
    authUserId,
    entryMode,
    isHydrated,
    isSupabaseMode,
    pipeBlendType,
    pipeComponents,
    pipeCutType,
    pipeEntryService,
    pipeForm,
    pipeNicotineStrength,
    pipeRatings,
    pipeTimeOfDay,
    remoteReady
  ]);

  useEffect(() => {
    if (!isHydrated) return;

    const draft = {
      form: cigarForm,
      timeOfDay: cigarTimeOfDay,
      wrapperShade: cigarWrapperShade,
      ratings: cigarRatings,
      entryMode
    };

    try {
      browserPipeJournalRepository.saveCigarDraft(draft);
    } catch (error) {
      console.error("Failed to save cigar draft", error);
    }
  }, [cigarForm, cigarRatings, cigarTimeOfDay, cigarWrapperShade, entryMode, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      pipeEntryService.saveEntries(pipeEntries);
    } catch (error) {
      console.error("Failed to persist pipe entries", error);
    }
  }, [isHydrated, pipeEntries, pipeEntryService]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      browserPipeJournalRepository.saveCigarEntries(cigarEntries);
    } catch (error) {
      console.error("Failed to persist cigar entries", error);
    }
  }, [cigarEntries, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const draft: SpiritDraftState = {
      form: spiritForm,
      rating: spiritRating,
      entryMode
    };

    try {
      browserPipeJournalRepository.saveSpiritDraft(draft);
    } catch (error) {
      console.error("Failed to save spirit draft", error);
    }
  }, [entryMode, isHydrated, spiritForm, spiritRating]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      browserPipeJournalRepository.saveSpiritEntries(spiritEntries);
    } catch (error) {
      console.error("Failed to persist spirit entries", error);
    }
  }, [isHydrated, spiritEntries]);

  useEffect(() => {
    if (!isHydrated || !isSupabaseMode || !authUserId || !remoteReady) return;

    void saveRemoteJournalEntries([...pipeEntries, ...cigarEntries, ...spiritEntries])
      .then(() => setSyncNotice("Journal saved to your profile."))
      .catch((error) => {
        console.error("Failed to sync remote journal entries", error);
        setSyncNotice("I couldn't save your journal changes yet.");
      });
  }, [authUserId, cigarEntries, isHydrated, isSupabaseMode, pipeEntries, remoteReady, spiritEntries]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(COLLECTION_CIGARS_KEY, JSON.stringify(collectionCigars));
    } catch (error) {
      console.error("Failed to persist collection cigars", error);
    }
  }, [collectionCigars, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(COLLECTION_TOBACCOS_KEY, JSON.stringify(collectionTobaccos));
    } catch (error) {
      console.error("Failed to persist collection tobaccos", error);
    }
  }, [collectionTobaccos, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(COLLECTION_PIPES_KEY, JSON.stringify(collectionPipes));
    } catch (error) {
      console.error("Failed to persist collection pipes", error);
    }
  }, [collectionPipes, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(COLLECTION_BOTTLES_KEY, JSON.stringify(collectionBottles));
    } catch (error) {
      console.error("Failed to persist collection bottles", error);
    }
  }, [collectionBottles, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(COLLECTION_WISHLIST_CIGARS_KEY, JSON.stringify(collectionWishlistCigars));
  }, [collectionWishlistCigars, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(COLLECTION_WISHLIST_PIPES_KEY, JSON.stringify(collectionWishlistPipes));
  }, [collectionWishlistPipes, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(COLLECTION_WISHLIST_BOTTLES_KEY, JSON.stringify(collectionWishlistBottles));
  }, [collectionWishlistBottles, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isSupabaseMode || !authUserId || !remoteReady) return;

    const collectionState: CollectionState = {
      cigars: collectionCigars,
      tobaccos: collectionTobaccos,
      pipes: collectionPipes,
      bottles: collectionBottles,
      wishlistCigars: collectionWishlistCigars,
      wishlistPipes: collectionWishlistPipes,
      wishlistBottles: collectionWishlistBottles
    };

    void saveRemoteCollectionState(collectionState).catch((error) => {
      console.error("Failed to sync remote collection", error);
      setSyncNotice("I couldn't save your collection changes yet.");
    });
  }, [
    authUserId,
    collectionBottles,
    collectionCigars,
    collectionPipes,
    collectionTobaccos,
    collectionWishlistBottles,
    collectionWishlistCigars,
    collectionWishlistPipes,
    isHydrated,
    isSupabaseMode,
    remoteReady
  ]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      catalogService.saveUserCatalog(userCatalog);
    } catch (error) {
      console.error("Failed to persist user catalog", error);
    }

    if (!isSupabaseMode || !authUserId || !remoteReady) return;

    void saveRemoteUserCatalog(userCatalog).catch((error) => {
      console.error("Failed to sync remote user catalog", error);
      setSyncNotice("I couldn't save your personal catalog yet.");
    });
  }, [authUserId, catalogService, isHydrated, isSupabaseMode, remoteReady, userCatalog]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  function updatePipeField<K extends keyof PipeFormState>(key: K, value: PipeFormState[K]) {
    setPipeForm((current) => ({ ...current, [key]: value }));
  }

  function updateCigarField<K extends keyof CigarFormState>(key: K, value: CigarFormState[K]) {
    setCigarForm((current) => ({ ...current, [key]: value }));
  }

  function updateSpiritField<K extends keyof SpiritFormState>(key: K, value: SpiritFormState[K]) {
    setSpiritForm((current) => ({ ...current, [key]: value }));
  }

  function resetPipeDraft() {
    setPipeForm(defaultPipeForm);
    setPipeTimeOfDay("Evening");
    setPipeBlendType("English");
    setPipeCutType("Ribbon");
    setPipeNicotineStrength("Medium");
    setPipeComponents(["Latakia", "Orientals"]);
    setPipeRatings(defaultPipeRatings);
    setPipeRatingHover({});
    setEntryMode("quick");
    setEditingPipeEntryId(null);
    try {
      pipeEntryService.clearDraft();
    } catch (error) {
      console.error("Failed to clear pipe draft", error);
    }

    if (isSupabaseMode && authUserId && remoteReady) {
      void clearRemotePipeDraft().catch((error) => {
        console.error("Failed to clear remote pipe draft", error);
      });
    }
  }

  function resetCigarDraft() {
    setCigarForm(defaultCigarForm);
    setCigarTimeOfDay("Evening");
    setCigarWrapperShade("Natural");
    setCigarRatings(defaultCigarRatings);
    setCigarRatingHover({});
    setEntryMode("quick");
    setEditingCigarEntryId(null);
    try {
      browserPipeJournalRepository.clearCigarDraft();
    } catch (error) {
      console.error("Failed to clear cigar draft", error);
    }
  }

  function resetSpiritDraft() {
    setSpiritForm(defaultSpiritForm);
    setSpiritRating(0);
    setSpiritRatingHover(0);
    setEntryMode("quick");
    setEditingSpiritEntryId(null);
    try {
      browserPipeJournalRepository.clearSpiritDraft();
    } catch (error) {
      console.error("Failed to clear spirit draft", error);
    }
  }

  function openPipeEntryDetail(entryId: string) {
    setSelectedPipeEntryId(entryId);
    setSelectedCategory("pipe");
    setView("detail");
  }

  function openCigarEntryDetail(entryId: string) {
    setSelectedCigarEntryId(entryId);
    setSelectedCategory("cigar");
    setView("detail");
  }

  function openSpiritEntryDetail(entryId: string) {
    setSelectedSpiritEntryId(entryId);
    setSelectedCategory("spirits");
    setView("detail");
  }

  function togglePipeFavorite(entryId: string) {
    setPipeEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              isFavorite: !entry.isFavorite
            }
          : entry
      )
    );
  }

  function toggleCigarFavorite(entryId: string) {
    setCigarEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              isFavorite: !entry.isFavorite
            }
          : entry
      )
    );
  }

  function toggleSpiritFavorite(entryId: string) {
    setSpiritEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              isFavorite: !entry.isFavorite
            }
          : entry
      )
    );
  }

  function startEditingPipeEntry(entry: PipeEntry, forceFullEntry = false) {
    setSelectedCategory("pipe");
    setSelectedPipeEntryId(entry.id);
    setEditingPipeEntryId(entry.id);
    applyPipeEntryToForm(entry);
    if (forceFullEntry) {
      setEntryMode("full");
    }
    setView("form");
  }

  function startEditingCigarEntry(entry: CigarEntry, forceFullEntry = false) {
    setSelectedCategory("cigar");
    setSelectedCigarEntryId(entry.id);
    setEditingCigarEntryId(entry.id);
    applyCigarEntryToForm(entry);
    if (forceFullEntry) {
      setEntryMode("full");
    }
    setView("form");
  }

  function startEditingSpiritEntry(entry: SpiritEntry, forceFullEntry = false) {
    setSelectedCategory("spirits");
    setSelectedSpiritEntryId(entry.id);
    setEditingSpiritEntryId(entry.id);
    applySpiritEntryToForm(entry);
    if (forceFullEntry) {
      setEntryMode("full");
    }
    setView("form");
  }

  function handleFormBack() {
    if (isEditingPipeEntry && selectedPipeEntryId) {
      setEditingPipeEntryId(null);
      setView("detail");
      return;
    }

    if (isEditingCigarEntry && selectedCigarEntryId) {
      setEditingCigarEntryId(null);
      setView("detail");
      return;
    }

    if (isEditingSpiritEntry && selectedSpiritEntryId) {
      setEditingSpiritEntryId(null);
      setView("detail");
      return;
    }

    setView("picker");
  }

  async function sendMagicLink() {
    if (!authEmailInput.trim()) {
      window.alert("Please enter your email first.");
      return;
    }

    setAuthBusy(true);
    setAuthNotice(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmailInput.trim(),
        options: {
          emailRedirectTo: getProfileAuthRedirectUrl()
        }
      });

      if (error) {
        throw error;
      }

      setAuthNotice("Check your email for the sign-in link to finish creating your profile.");
    } catch (error) {
      console.error("Failed to send Supabase magic link", error);
      setAuthNotice(error instanceof Error ? error.message : "I couldn't send your sign-in email.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signInWithProvider(provider: SocialAuthProvider) {
    setAuthBusy(true);
    setAuthNotice(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getProfileAuthRedirectUrl()
        }
      });

      if (error) {
        throw error;
      }

      setAuthNotice("Taking you to your sign-in provider...");
    } catch (error) {
      console.error(`Failed to start ${provider} sign-in`, error);
      setAuthNotice(error instanceof Error ? error.message : "I couldn't start that sign-in method yet.");
      setAuthBusy(false);
    }
  }

  async function signOutOfCloud() {
    setAuthBusy(true);
    setAuthNotice(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthUserId(null);
      setAuthUserEmail(null);
      setRemoteReady(false);
      setSyncNotice("Signed out. Your journal is local-only again until you reconnect your profile.");
    } catch (error) {
      console.error("Failed to sign out of Supabase", error);
      setAuthNotice(error instanceof Error ? error.message : "I couldn't sign you out right now.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function saveDeviceJournalToProfile() {
    if (!authUserId) {
      setAuthNotice("Sign in before saving this device's journal to your profile.");
      return;
    }

    setAuthBusy(true);
    setAuthNotice("Saving this device's journal to your profile...");

    try {
      await saveRemoteJournalEntries([...pipeEntries, ...cigarEntries, ...spiritEntries]);
      setAuthNotice("Journal saved to your profile.");
      setSyncNotice("Journal saved to your profile.");
    } catch (error) {
      console.error("Failed to save device journal to profile", error);
      setAuthNotice(error instanceof Error ? error.message : "I couldn't save this journal to your profile yet.");
    } finally {
      setAuthBusy(false);
    }
  }

  function openNewSession(category: Category) {
    setSelectedCategory(category);
    setView("form");
    if (category !== "pipe") {
      setEntryMode("quick");
    }
  }

  function openCollectionAdd(category: Category) {
    setSelectedCategory(category);
    setEntryMode("quick");
    setView("form");
  }

  function updateCollectionCigarField<K extends keyof typeof defaultCollectionCigarForm>(
    key: K,
    value: (typeof defaultCollectionCigarForm)[K]
  ) {
    setCollectionCigarForm((current) => ({ ...current, [key]: value }));
  }

  function updateCollectionTobaccoField<K extends keyof typeof defaultCollectionTobaccoForm>(
    key: K,
    value: (typeof defaultCollectionTobaccoForm)[K]
  ) {
    setCollectionTobaccoForm((current) => ({ ...current, [key]: value }));
  }

  function updateCollectionPipeField<K extends keyof typeof defaultCollectionPipeForm>(
    key: K,
    value: (typeof defaultCollectionPipeForm)[K]
  ) {
    setCollectionPipeForm((current) => ({ ...current, [key]: value }));
  }

  function updateCollectionBottleField<K extends keyof typeof defaultCollectionBottleForm>(
    key: K,
    value: (typeof defaultCollectionBottleForm)[K]
  ) {
    setCollectionBottleForm((current) => ({ ...current, [key]: value }));
  }

  function openAddCollectionCigar() {
    setCollectionFormKind("cigar");
    setEditingCollectionCigarId(null);
    setCollectionCigarForm(defaultCollectionCigarForm);
    setView("collectionForm");
  }

  function openAddCollectionTobacco() {
    setCollectionFormKind("tobacco");
    setEditingCollectionTobaccoId(null);
    setCollectionTobaccoForm(defaultCollectionTobaccoForm);
    setView("collectionForm");
  }

  function openAddCollectionPipe() {
    setCollectionFormKind("pipe");
    setEditingCollectionPipeId(null);
    setCollectionPipeForm(defaultCollectionPipeForm);
    setView("collectionForm");
  }

  function openAddCollectionBottle() {
    setCollectionFormKind("bottle");
    setEditingCollectionBottleId(null);
    setCollectionBottleForm(defaultCollectionBottleForm);
    setView("collectionForm");
  }

  function openCollectionDetail(kind: CollectionDetailKind, id: string) {
    setSelectedCollectionDetailKind(kind);
    setSelectedCollectionDetailId(id);
    setView("collectionDetail");
  }

  function startEditingCollectionCigar(item: CollectionCigarItem) {
    setEditingCollectionCigarId(item.id);
    setCollectionFormKind("cigar");
    setCollectionCigarForm({
      brand: item.brand,
      lineName: item.lineName,
      vitola: item.vitola,
      quantity: String(item.quantity),
      format: "Single",
      dateAdded: item.dateAdded,
      wrapperShade: item.wrapperShade,
      status: item.status || "Resting",
      notes: item.notes
    });
    setView("collectionForm");
  }

  function startEditingCollectionTobacco(item: CollectionTobaccoItem) {
    setEditingCollectionTobaccoId(item.id);
    setCollectionFormKind("tobacco");
    setCollectionTobaccoForm({
      name: item.name,
      brand: item.brand,
      style: item.style,
      cut: item.cut,
      tinDate: item.tinDate,
      quantity: String(item.quantity),
      storageFormat: item.storageFormat,
      dateAcquired: item.dateAcquired,
      source: item.source,
      nicotine: item.nicotine,
      roomNote: item.roomNote,
      status: item.status || "Sealed",
      discontinued: item.discontinued,
      notes: item.notes
    });
    setView("collectionForm");
  }

  function startEditingCollectionPipe(item: CollectionPipeItem) {
    setEditingCollectionPipeId(item.id);
    setCollectionFormKind("pipe");
    setCollectionPipeForm({
      name: item.name,
      maker: item.maker,
      shape: item.shape,
      material: item.material,
      finish: item.finish,
      stem: item.stem,
      status: item.status || "Active",
      dateAcquired: item.dateAcquired,
      source: item.source,
      notes: item.notes
    });
    setView("collectionForm");
  }

  function startEditingCollectionBottle(item: CollectionBottleItem) {
    setEditingCollectionBottleId(item.id);
    setCollectionFormKind("bottle");
    setCollectionBottleForm({
      name: item.name,
      distillery: item.distillery,
      spiritType: item.spiritType,
      proof: item.proof,
      age: item.age,
      status: item.status || "Sealed",
      notes: item.notes
    });
    setView("collectionForm");
  }

  function saveCollectionCigar() {
    const brand = collectionCigarForm.brand.trim();
    if (!brand) return;

    const item: CollectionCigarItem = {
      id: editingCollectionCigarId ?? `collection-cigar-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      brand,
      lineName: collectionCigarForm.lineName.trim(),
      vitola: collectionCigarForm.vitola,
      quantity: Math.max(1, Number(collectionCigarForm.quantity) || 1),
      dateAdded: collectionCigarForm.dateAdded,
      wrapperShade: collectionCigarForm.wrapperShade,
      status: collectionCigarForm.status,
      notes: collectionCigarForm.notes.trim(),
      createdAt: editingCollectionCigarId
        ? collectionCigars.find((entry) => entry.id === editingCollectionCigarId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString()
    };

    setCollectionCigars((current) =>
      editingCollectionCigarId ? current.map((entry) => (entry.id === editingCollectionCigarId ? item : entry)) : [item, ...current]
    );
    setSelectedCollectionDetailKind("cigar");
    setSelectedCollectionDetailId(item.id);
    setEditingCollectionCigarId(null);
    setCollectionCigarForm(defaultCollectionCigarForm);
    setCollectionTab("humidor");
    setView("collectionDetail");
  }

  function saveCollectionTobacco() {
    const name = collectionTobaccoForm.name.trim();
    if (!name) return;

    const item: CollectionTobaccoItem = {
      id: editingCollectionTobaccoId ?? `collection-tobacco-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      brand: collectionTobaccoForm.brand.trim(),
      style: collectionTobaccoForm.style,
      cut: collectionTobaccoForm.cut,
      tinDate: collectionTobaccoForm.tinDate.trim(),
      quantity: Math.max(1, Number(collectionTobaccoForm.quantity) || 1),
      storageFormat: collectionTobaccoForm.storageFormat,
      dateAcquired: collectionTobaccoForm.dateAcquired,
      source: collectionTobaccoForm.source.trim(),
      nicotine: collectionTobaccoForm.nicotine,
      roomNote: collectionTobaccoForm.roomNote,
      status: collectionTobaccoForm.status,
      discontinued: collectionTobaccoForm.discontinued,
      notes: collectionTobaccoForm.notes.trim(),
      createdAt: editingCollectionTobaccoId
        ? collectionTobaccos.find((entry) => entry.id === editingCollectionTobaccoId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString()
    };

    setCollectionTobaccos((current) =>
      editingCollectionTobaccoId ? current.map((entry) => (entry.id === editingCollectionTobaccoId ? item : entry)) : [item, ...current]
    );
    setSelectedCollectionDetailKind("tobacco");
    setSelectedCollectionDetailId(item.id);
    setEditingCollectionTobaccoId(null);
    setCollectionTobaccoForm(defaultCollectionTobaccoForm);
    setCollectionTab("cellar");
    setView("collectionDetail");
  }

  function saveCollectionPipe() {
    const name = collectionPipeForm.name.trim();
    if (!name) return;

    const item: CollectionPipeItem = {
      id: editingCollectionPipeId ?? `collection-pipe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      maker: collectionPipeForm.maker.trim(),
      shape: collectionPipeForm.shape,
      material: collectionPipeForm.material,
      finish: collectionPipeForm.finish,
      stem: collectionPipeForm.stem,
      status: collectionPipeForm.status,
      dateAcquired: collectionPipeForm.dateAcquired,
      source: collectionPipeForm.source.trim(),
      notes: collectionPipeForm.notes.trim(),
      createdAt: editingCollectionPipeId
        ? collectionPipes.find((entry) => entry.id === editingCollectionPipeId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString()
    };

    setCollectionPipes((current) =>
      editingCollectionPipeId ? current.map((entry) => (entry.id === editingCollectionPipeId ? item : entry)) : [item, ...current]
    );
    setSelectedCollectionDetailKind("pipe");
    setSelectedCollectionDetailId(item.id);
    setEditingCollectionPipeId(null);
    setCollectionPipeForm(defaultCollectionPipeForm);
    setCollectionTab("cellar");
    setView("collectionDetail");
  }

  function saveCollectionBottle() {
    const name = collectionBottleForm.name.trim();
    if (!name) return;

    const item: CollectionBottleItem = {
      id: editingCollectionBottleId ?? `collection-bottle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      distillery: collectionBottleForm.distillery.trim(),
      spiritType: collectionBottleForm.spiritType,
      proof: collectionBottleForm.proof.trim(),
      age: collectionBottleForm.age.trim(),
      status: collectionBottleForm.status,
      notes: collectionBottleForm.notes.trim(),
      createdAt: editingCollectionBottleId
        ? collectionBottles.find((entry) => entry.id === editingCollectionBottleId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString()
    };

    setCollectionBottles((current) =>
      editingCollectionBottleId ? current.map((entry) => (entry.id === editingCollectionBottleId ? item : entry)) : [item, ...current]
    );
    setSelectedCollectionDetailKind("bottle");
    setSelectedCollectionDetailId(item.id);
    setEditingCollectionBottleId(null);
    setCollectionBottleForm(defaultCollectionBottleForm);
    setCollectionTab("bar");
    setView("collectionDetail");
  }

  function getWishlistItems(kind: CollectionWishlistKind) {
    if (kind === "cigar") return collectionWishlistCigars;
    if (kind === "pipe") return collectionWishlistPipes;
    return collectionWishlistBottles;
  }

  function addCollectionWishlistItem(kind: CollectionWishlistKind) {
    const trimmed = collectionWishlistInput.trim();
    if (!trimmed) return;

    if (kind === "cigar") {
      setCollectionWishlistCigars((current) =>
        current.some((item) => item.toLowerCase() === trimmed.toLowerCase()) ? current : [trimmed, ...current]
      );
    } else if (kind === "pipe") {
      setCollectionWishlistPipes((current) =>
        current.some((item) => item.toLowerCase() === trimmed.toLowerCase()) ? current : [trimmed, ...current]
      );
    } else {
      setCollectionWishlistBottles((current) =>
        current.some((item) => item.toLowerCase() === trimmed.toLowerCase()) ? current : [trimmed, ...current]
      );
    }

    setCollectionWishlistInput("");
  }

  function removeCollectionWishlistItem(kind: CollectionWishlistKind, value: string) {
    if (kind === "cigar") {
      setCollectionWishlistCigars((current) => current.filter((item) => item !== value));
    } else if (kind === "pipe") {
      setCollectionWishlistPipes((current) => current.filter((item) => item !== value));
    } else {
      setCollectionWishlistBottles((current) => current.filter((item) => item !== value));
    }
  }

  function togglePipeComponent(component: string) {
    setPipeComponents((current) =>
      current.includes(component)
        ? current.filter((item) => item !== component)
        : [...current, component]
    );
  }

  function setPipeRating(key: keyof PipeRatings, value: number) {
    setPipeRatings((current) => ({
      ...current,
      [key]: current[key] === value ? 0 : value
    }));
  }

  function setCigarRating(key: keyof CigarRatings, value: number) {
    setCigarRatings((current) => ({
      ...current,
      [key]: current[key] === value ? 0 : value
    }));
  }

  function toggleCigarFlavorNote(note: string) {
    setCigarForm((current) => ({
      ...current,
      flavorNotes: current.flavorNotes.includes(note)
        ? current.flavorNotes.filter((item) => item !== note)
        : [...current.flavorNotes, note]
    }));
  }

  function addCustomCigarFlavorNote() {
    const trimmed = customCigarFlavor.trim();
    if (!trimmed) return;

    const existing = cigarForm.flavorNotes.find((note) => note.toLowerCase() === trimmed.toLowerCase());
    if (!existing) {
      setCigarForm((current) => ({
        ...current,
        flavorNotes: [...current.flavorNotes, trimmed]
      }));
    }
    setCustomCigarFlavor("");
  }

  function toggleSpiritFlavorNote(note: string) {
    setSpiritForm((current) => ({
      ...current,
      flavorNotes: current.flavorNotes.includes(note)
        ? current.flavorNotes.filter((item) => item !== note)
        : [...current.flavorNotes, note]
    }));
  }

  function addCustomSpiritFlavorNote() {
    const trimmed = customSpiritFlavor.trim();
    if (!trimmed) return;

    const existing = spiritForm.flavorNotes.find((note) => note.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setCustomSpiritFlavor("");
      return;
    }

    setSpiritForm((current) => ({
      ...current,
      flavorNotes: [...current.flavorNotes, trimmed]
    }));
    setCustomSpiritFlavor("");
  }

  function toggleSpiritTag(tag: string) {
    setSpiritForm((current) => ({
      ...current,
      quickTags: current.quickTags.includes(tag)
        ? current.quickTags.filter((item) => item !== tag)
        : [...current.quickTags, tag]
    }));
  }

  function selectSpiritBrandSuggestion(suggestion: CatalogSuggestion) {
    updateSpiritField("brand", suggestion.label);
  }

  function selectSpiritNameSuggestion(suggestion: CatalogSuggestion) {
    const item = catalogService.getItemById(catalogStore, suggestion.id);
    if (!item) {
      updateSpiritField("name", suggestion.label);
      return;
    }

    updateSpiritField("name", item.name);
    if (item.brandId) {
      const brand = catalogService.getBrandById(catalogStore, item.brandId);
      if (brand) {
        updateSpiritField("brand", brand.name);
      }
    }
    const metadata = item.metadata as import("@/lib/catalog").SpiritMetadata;
    updateSpiritField("spiritType", metadata.spiritType || "Bourbon");
    updateSpiritField("ageStatement", metadata.ageStatement || "");
    updateSpiritField("proof", metadata.proof ? String(metadata.proof) : "");
    updateSpiritField("mashbill", metadata.mashbill || "");
    updateSpiritField("barrelTypeFinish", metadata.barrelTypeFinish || "");
    updateSpiritField("batchBarrelNumber", metadata.batchBarrelNumber || "");
    updateSpiritField("pricePaid", metadata.price || "");
  }

  function addCustomSpiritBrandToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const existing = catalogService.findBrandByExactName(catalogStore, "spirits", trimmedName);
    if (existing) {
      updateSpiritField("brand", existing.name);
      return;
    }
    const customBrand = catalogService.createUserBrand("spirits", trimmedName);
    setUserCatalog((current) => ({
      brands: [customBrand, ...current.brands],
      items: current.items
    }));
    updateSpiritField("brand", customBrand.name);
  }

  function addCustomSpiritToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const activeBrand = spiritForm.brand.trim()
      ? catalogService.findBrandByExactName(catalogStore, "spirits", spiritForm.brand)
      : null;
    const existing = catalogService.findItemByExactName(catalogStore, "spirits", trimmedName, activeBrand?.id ?? undefined);
    if (existing) {
      updateSpiritField("name", existing.name);
      if (existing.brandId) {
        const brand = catalogService.getBrandById(catalogStore, existing.brandId);
        if (brand) updateSpiritField("brand", brand.name);
      }
      return;
    }
    let brand = activeBrand;
    if (!brand && spiritForm.brand.trim()) {
      brand = catalogService.createUserBrand("spirits", spiritForm.brand);
      setUserCatalog((current) => ({
        brands: [brand!, ...current.brands],
        items: current.items
      }));
    }
    const customItem = catalogService.createUserItem("spirits", trimmedName, brand?.id ?? null, {
      spiritType: spiritForm.spiritType,
      proof: Number(spiritForm.proof) || undefined,
      ageStatement: spiritForm.ageStatement.trim() || undefined,
      mashbill: spiritForm.mashbill.trim() || undefined,
      barrelTypeFinish: spiritForm.barrelTypeFinish.trim() || undefined,
      batchBarrelNumber: spiritForm.batchBarrelNumber.trim() || undefined,
      price: spiritForm.pricePaid.trim() || undefined
    });
    setUserCatalog((current) => ({
      brands: brand && !current.brands.some((entry) => entry.id === brand!.id) ? [brand!, ...current.brands] : current.brands,
      items: [customItem, ...current.items]
    }));
    updateSpiritField("name", customItem.name);
    if (brand) updateSpiritField("brand", brand.name);
  }

  function applyBlendMetadata(item: CatalogItem) {
    const metadata = item.metadata as PipeTobaccoMetadata;

    if (metadata.blendFamily) {
      setPipeBlendType(metadata.blendFamily);
    }

    if (metadata.cutType) {
      setPipeCutType(metadata.cutType);
    }

    if (metadata.components?.length) {
      setPipeComponents(metadata.components);
    }

    if (metadata.strength) {
      setPipeNicotineStrength(metadata.strength);
    }
  }

  function findPipeBrandFromPipeUsed(value: string) {
    const trimmedValue = value.trim().toLowerCase();
    if (!trimmedValue) return null;

    return (
      catalogStore.brands
        .filter((brand) => brand.type === "pipes")
        .sort((a, b) => b.name.length - a.name.length)
        .find((brand) => trimmedValue.startsWith(brand.name.toLowerCase())) ?? null
    );
  }

  function buildPipeUsedLabel(item: CatalogItem) {
    return catalogService.getCatalogItemDisplayName(catalogStore, item);
  }

  function addCustomBrandToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existing = catalogService.findBrandByExactName(catalogStore, "pipeTobaccos", trimmedName);
    if (existing) {
      updatePipeField("brand", existing.name);
      return;
    }

    const customBrand = catalogService.createUserBrand("pipeTobaccos", trimmedName);
    setUserCatalog((current) => ({
      brands: [customBrand, ...current.brands],
      items: current.items
    }));
    updatePipeField("brand", customBrand.name);
  }

  function addCustomBlendToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const activeBrand = pipeForm.brand.trim()
      ? catalogService.findBrandByExactName(catalogStore, "pipeTobaccos", pipeForm.brand)
      : null;
    const existing = catalogService.findItemByExactName(
      catalogStore,
      "pipeTobaccos",
      trimmedName,
      activeBrand?.id ?? undefined
    );

    if (existing) {
      updatePipeField("blendName", existing.name);
      if (existing.brandId) {
        const matchingBrand = catalogService.getBrandById(catalogStore, existing.brandId);
        if (matchingBrand) {
          updatePipeField("brand", matchingBrand.name);
        }
      }
      return;
    }

    let brand = activeBrand;
    if (!brand && pipeForm.brand.trim()) {
      brand = catalogService.createUserBrand("pipeTobaccos", pipeForm.brand);
      setUserCatalog((current) => ({
        brands: [brand!, ...current.brands],
        items: current.items
      }));
    }

    const customItem = catalogService.createUserItem("pipeTobaccos", trimmedName, brand?.id ?? null, {
      blendFamily: pipeBlendType,
      cutType: pipeCutType
    });

    setUserCatalog((current) => ({
      brands: brand && !current.brands.some((entry) => entry.id === brand!.id) ? [brand!, ...current.brands] : current.brands,
      items: [customItem, ...current.items]
    }));
    updatePipeField("blendName", customItem.name);
    if (brand) {
      updatePipeField("brand", brand.name);
    }
  }

  function addCustomPipeToUserCatalog(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const existing = catalogStore.items.find(
      (item) => item.type === "pipes" && buildPipeUsedLabel(item).toLowerCase() === trimmedValue.toLowerCase()
    );
    if (existing) {
      updatePipeField("pipeUsed", buildPipeUsedLabel(existing));
      return;
    }

    let brand = findPipeBrandFromPipeUsed(trimmedValue);
    let pipeName = trimmedValue;

    if (brand) {
      pipeName = trimmedValue.slice(brand.name.length).trim() || trimmedValue;
    } else {
      const matchedBrand = pipeForm.pipeUsed.trim()
        ? catalogService.findBrandByExactName(catalogStore, "pipes", pipeForm.pipeUsed)
        : null;
      if (matchedBrand) {
        brand = matchedBrand;
        pipeName = trimmedValue;
      }
    }

    const nextBrands = [...userCatalog.brands];
    if (!brand && trimmedValue.includes(" ")) {
      const [firstWord] = trimmedValue.split(" ");
      const existingBrand = catalogService.findBrandByExactName(catalogStore, "pipes", firstWord);
      if (existingBrand) {
        brand = existingBrand;
        pipeName = trimmedValue.slice(existingBrand.name.length).trim() || trimmedValue;
      }
    }

    const customItem = catalogService.createUserItem("pipes", pipeName, brand?.id ?? null, {
      maker: brand?.name
    });

    setUserCatalog((current) => ({
      brands: nextBrands,
      items: [customItem, ...current.items]
    }));
    updatePipeField("pipeUsed", brand ? `${brand.name} ${pipeName}`.trim() : trimmedValue);
  }

  function selectPipeBrandSuggestion(suggestion: CatalogSuggestion) {
    updatePipeField("brand", suggestion.label);
  }

  function selectPipeBlendSuggestion(suggestion: CatalogSuggestion) {
    const item = catalogService.getItemById(catalogStore, suggestion.id);
    if (!item) {
      updatePipeField("blendName", suggestion.label);
      return;
    }

    updatePipeField("blendName", item.name);

    if (item.brandId) {
      const brand = catalogService.getBrandById(catalogStore, item.brandId);
      if (brand) {
        updatePipeField("brand", brand.name);
      }
    }

    applyBlendMetadata(item);
  }

  function selectPipeUsedSuggestion(suggestion: CatalogSuggestion) {
    const item = catalogService.getItemById(catalogStore, suggestion.id);
    if (!item) {
      updatePipeField("pipeUsed", suggestion.label);
      return;
    }

    updatePipeField("pipeUsed", buildPipeUsedLabel(item));
  }

  function applyCigarMetadata(item: CatalogItem) {
    const metadata = item.metadata as CigarMetadata;

    updateCigarField("vitola", metadata.vitola || "");
    updateCigarField("countryFactory", metadata.countryFactory || "");
    updateCigarField("wrapper", metadata.wrapper || "");
    updateCigarField("binder", metadata.binder || "");
    updateCigarField("filler", metadata.filler || "");
    if (metadata.wrapperShade) {
      setCigarWrapperShade(metadata.wrapperShade);
    }
  }

  function applyCollectionCigarMetadata(item: CatalogItem) {
    const metadata = item.metadata as CigarMetadata;

    updateCollectionCigarField("vitola", metadata.vitola || "");
    updateCollectionCigarField("wrapperShade", metadata.wrapperShade || "");
  }

  function addCustomCigarBrandToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existing = catalogService.findBrandByExactName(catalogStore, "cigars", trimmedName);
    if (existing) {
      updateCigarField("brand", existing.name);
      return;
    }

    const customBrand = catalogService.createUserBrand("cigars", trimmedName);
    setUserCatalog((current) => ({
      brands: [customBrand, ...current.brands],
      items: current.items
    }));
    updateCigarField("brand", customBrand.name);
  }

  function addCustomCigarLineToUserCatalog(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const activeBrand = cigarForm.brand.trim()
      ? catalogService.findBrandByExactName(catalogStore, "cigars", cigarForm.brand)
      : null;
    const existing = catalogService.findItemByExactName(
      catalogStore,
      "cigars",
      trimmedName,
      activeBrand?.id ?? undefined
    );

    if (existing) {
      updateCigarField("lineName", existing.name);
      if (existing.brandId) {
        const brand = catalogService.getBrandById(catalogStore, existing.brandId);
        if (brand) {
          updateCigarField("brand", brand.name);
        }
      }
      applyCigarMetadata(existing);
      return;
    }

    let brand = activeBrand;
    if (!brand && cigarForm.brand.trim()) {
      brand = catalogService.createUserBrand("cigars", cigarForm.brand);
      setUserCatalog((current) => ({
        brands: [brand!, ...current.brands],
        items: current.items
      }));
    }

    const customItem = catalogService.createUserItem("cigars", trimmedName, brand?.id ?? null, {
      line: trimmedName,
      vitola: cigarForm.vitola.trim() || undefined,
      wrapper: cigarForm.wrapper.trim() || undefined,
      binder: cigarForm.binder.trim() || undefined,
      filler: cigarForm.filler.trim() || undefined,
      countryFactory: cigarForm.countryFactory.trim() || undefined,
      wrapperShade: cigarWrapperShade
    });

    setUserCatalog((current) => ({
      brands: brand && !current.brands.some((entry) => entry.id === brand!.id) ? [brand!, ...current.brands] : current.brands,
      items: [customItem, ...current.items]
    }));
    updateCigarField("lineName", customItem.name);
    if (brand) {
      updateCigarField("brand", brand.name);
    }
  }

  function selectCigarBrandSuggestion(suggestion: CatalogSuggestion) {
    updateCigarField("brand", suggestion.label);
  }

  function selectCigarLineSuggestion(suggestion: CatalogSuggestion) {
    const item = catalogService.getItemById(catalogStore, suggestion.id);
    if (!item) {
      updateCigarField("lineName", suggestion.label);
      return;
    }

    updateCigarField("lineName", item.name);
    if (item.brandId) {
      const brand = catalogService.getBrandById(catalogStore, item.brandId);
      if (brand) {
        updateCigarField("brand", brand.name);
      }
    }
    applyCigarMetadata(item);
  }

  function savePipeEntry() {
    if (!pipeForm.blendName.trim()) {
      window.alert("Please enter a blend name.");
      return;
    }

    const normalizedBrand = pipeForm.brand.trim();
    const normalizedBlend = pipeForm.blendName.trim();
    let resolvedBrand = normalizedBrand
      ? catalogService.findBrandByExactName(catalogStore, "pipeTobaccos", normalizedBrand)
      : null;
    let resolvedBlend = catalogService.findItemByExactName(
      catalogStore,
      "pipeTobaccos",
      normalizedBlend,
      resolvedBrand?.id ?? undefined
    );
    let resolvedPipe = catalogStore.items.find(
      (item) => item.type === "pipes" && buildPipeUsedLabel(item).toLowerCase() === pipeForm.pipeUsed.trim().toLowerCase()
    ) ?? null;
    let entrySource: PipeEntry["catalogSource"] = "manual";

    const nextUserCatalog = {
      brands: [...userCatalog.brands],
      items: [...userCatalog.items]
    };
    const existingEntry = editingPipeEntryId
      ? pipeEntries.find((entry) => entry.id === editingPipeEntryId) ?? null
      : null;

    if (normalizedBrand && !resolvedBrand) {
      resolvedBrand = catalogService.createUserBrand("pipeTobaccos", normalizedBrand);
      nextUserCatalog.brands.unshift(resolvedBrand);
      entrySource = "user";
    } else if (resolvedBrand) {
      entrySource = resolvedBrand.source;
    }

    if (!resolvedBlend) {
      resolvedBlend = catalogService.createUserItem("pipeTobaccos", normalizedBlend, resolvedBrand?.id ?? null, {
        blendFamily: pipeBlendType,
        cutType: pipeCutType,
        components: pipeComponents,
        strength: pipeNicotineStrength
      });
      nextUserCatalog.items.unshift(resolvedBlend);
      entrySource = "user";
    } else {
      entrySource = resolvedBlend.source;
    }

    if (pipeForm.pipeUsed.trim() && !resolvedPipe) {
      const pipeBrand = findPipeBrandFromPipeUsed(pipeForm.pipeUsed);
      const pipeName = pipeBrand
        ? pipeForm.pipeUsed.trim().slice(pipeBrand.name.length).trim() || pipeForm.pipeUsed.trim()
        : pipeForm.pipeUsed.trim();

      resolvedPipe = catalogService.createUserItem("pipes", pipeName, pipeBrand?.id ?? null, {
        maker: pipeBrand?.name
      });
      nextUserCatalog.items.unshift(resolvedPipe);
    }

    const entry: PipeEntry = {
      id: existingEntry?.id ?? createJournalEntryId(),
      category: "pipe",
      entryMode,
      brandId: resolvedBrand?.id ?? null,
      blendId: resolvedBlend.id,
      pipeItemId: resolvedPipe?.id ?? null,
      catalogSource: entrySource,
      brand: normalizedBrand,
      blendName: normalizedBlend,
      date: pipeForm.date,
      timeOfDay: pipeTimeOfDay,
      setting: pipeForm.setting.trim(),
      location: pipeForm.location.trim(),
      pipeUsed: pipeForm.pipeUsed.trim(),
      lighterUsed: pipeForm.lighterUsed.trim(),
      blendType: pipeBlendType,
      cutType: pipeCutType,
      nicotineStrength: pipeNicotineStrength,
      components: pipeComponents,
      quickNotes: pipeForm.quickNotes.trim(),
      firstThirdNotes: pipeForm.firstThirdNotes.trim(),
      middleThirdNotes: pipeForm.middleThirdNotes.trim(),
      finalThirdNotes: pipeForm.finalThirdNotes.trim(),
      tinNotes: pipeForm.tinNotes.trim(),
      yearBlended: pipeForm.yearBlended.trim(),
      prepNotes: pipeForm.prepNotes.trim(),
      isFavorite: existingEntry?.isFavorite ?? false,
      ratings: pipeRatings,
      suggestedScore: pipeSuggestedScore,
      createdAt: existingEntry?.createdAt ?? new Date().toISOString()
    };

    setUserCatalog(nextUserCatalog);
    setPipeEntries((current) =>
      existingEntry ? current.map((item) => (item.id === existingEntry.id ? entry : item)) : [entry, ...current]
    );
    setSelectedPipeEntryId(entry.id);
    resetPipeDraft();
    setView(existingEntry ? "detail" : "home");
    setSelectedCategory("pipe");
    setActiveFilter("all");
    setActiveSort("newest");

    if (isSupabaseMode) {
      if (authUserId && remoteReady) {
        setSyncNotice("Saved to your journal. Your profile is updating now.");
      } else if (!authUserId) {
        setAuthNotice("Saved locally for now. Create your profile when you're ready to back it up across devices.");
      }
    }
  }

  function saveCigarEntry() {
    if (!cigarForm.lineName.trim()) {
      window.alert("Please enter a cigar line.");
      return;
    }

    const normalizedBrand = cigarForm.brand.trim();
    const normalizedLine = cigarForm.lineName.trim();
    let resolvedBrand = normalizedBrand
      ? catalogService.findBrandByExactName(catalogStore, "cigars", normalizedBrand)
      : null;
    let resolvedLine = catalogService.findItemByExactName(
      catalogStore,
      "cigars",
      normalizedLine,
      resolvedBrand?.id ?? undefined
    );
    let entrySource: CigarEntry["catalogSource"] = "manual";

    const nextUserCatalog = {
      brands: [...userCatalog.brands],
      items: [...userCatalog.items]
    };
    const existingEntry = editingCigarEntryId
      ? cigarEntries.find((entry) => entry.id === editingCigarEntryId) ?? null
      : null;

    if (normalizedBrand && !resolvedBrand) {
      resolvedBrand = catalogService.createUserBrand("cigars", normalizedBrand);
      nextUserCatalog.brands.unshift(resolvedBrand);
      entrySource = "user";
    } else if (resolvedBrand) {
      entrySource = resolvedBrand.source;
    }

    if (!resolvedLine) {
      resolvedLine = catalogService.createUserItem("cigars", normalizedLine, resolvedBrand?.id ?? null, {
        line: normalizedLine,
        vitola: cigarForm.vitola.trim() || undefined,
        wrapper: cigarForm.wrapper.trim() || undefined,
        binder: cigarForm.binder.trim() || undefined,
        filler: cigarForm.filler.trim() || undefined,
        countryFactory: cigarForm.countryFactory.trim() || undefined,
        wrapperShade: cigarWrapperShade
      });
      nextUserCatalog.items.unshift(resolvedLine);
      entrySource = "user";
    } else {
      entrySource = resolvedLine.source;
    }

    const entry: CigarEntry = {
      id: existingEntry?.id ?? createJournalEntryId(),
      category: "cigar",
      entryMode,
      brandId: resolvedBrand?.id ?? null,
      cigarItemId: resolvedLine.id,
      catalogSource: entrySource,
      brand: normalizedBrand,
      lineName: normalizedLine,
      date: cigarForm.date,
      purchaseDate: cigarForm.purchaseDate,
      boughtFrom: cigarForm.boughtFrom.trim(),
      price: cigarForm.price.trim(),
      restTime: cigarForm.restTime.trim(),
      timeOfDay: cigarTimeOfDay,
      setting: cigarForm.setting.trim(),
      location: cigarForm.location.trim(),
      vitola: cigarForm.vitola.trim(),
      cutType: cigarForm.cutType.trim(),
      countryFactory: cigarForm.countryFactory.trim(),
      wrapper: cigarForm.wrapper.trim(),
      binder: cigarForm.binder.trim(),
      filler: cigarForm.filler.trim(),
      strengthBand: cigarForm.strengthBand,
      flavorNotes: cigarForm.flavorNotes,
      quickNotes: cigarForm.quickNotes.trim(),
      firstThirdNotes: cigarForm.firstThirdNotes.trim(),
      middleThirdNotes: cigarForm.middleThirdNotes.trim(),
      finalThirdNotes: cigarForm.finalThirdNotes.trim(),
      pairing: cigarForm.pairing.trim(),
      buyAgain: cigarForm.buyAgain,
      isFavorite: existingEntry?.isFavorite ?? false,
      ratings: cigarRatings,
      suggestedScore: cigarSuggestedScore,
      createdAt: existingEntry?.createdAt ?? new Date().toISOString()
    };

    setUserCatalog(nextUserCatalog);
    setCigarEntries((current) =>
      existingEntry ? current.map((item) => (item.id === existingEntry.id ? entry : item)) : [entry, ...current]
    );
    setSelectedCigarEntryId(entry.id);
    resetCigarDraft();
    setView(existingEntry ? "detail" : "home");
    setSelectedCategory("cigar");
    setActiveFilter("all");
    setActiveSort("newest");
  }

  function saveSpiritEntry() {
    if (!spiritForm.name.trim()) {
      window.alert("Please enter a whiskey name.");
      return;
    }

    const normalizedBrand = spiritForm.brand.trim();
    const normalizedName = spiritForm.name.trim();
    let resolvedBrand = normalizedBrand
      ? catalogService.findBrandByExactName(catalogStore, "spirits", normalizedBrand)
      : null;
    let resolvedSpirit = catalogService.findItemByExactName(
      catalogStore,
      "spirits",
      normalizedName,
      resolvedBrand?.id ?? undefined
    );
    let entrySource: SpiritEntry["catalogSource"] = "manual";

    const nextUserCatalog = {
      brands: [...userCatalog.brands],
      items: [...userCatalog.items]
    };
    const existingEntry = editingSpiritEntryId
      ? spiritEntries.find((entry) => entry.id === editingSpiritEntryId) ?? null
      : null;

    if (normalizedBrand && !resolvedBrand) {
      resolvedBrand = catalogService.createUserBrand("spirits", normalizedBrand);
      nextUserCatalog.brands.unshift(resolvedBrand);
      entrySource = "user";
    } else if (resolvedBrand) {
      entrySource = resolvedBrand.source;
    }

    if (!resolvedSpirit) {
      resolvedSpirit = catalogService.createUserItem("spirits", normalizedName, resolvedBrand?.id ?? null, {
        spiritType: spiritForm.spiritType,
        proof: Number(spiritForm.proof) || undefined
      });
      nextUserCatalog.items.unshift(resolvedSpirit);
      entrySource = "user";
    } else {
      entrySource = resolvedSpirit.source;
    }

    const entry: SpiritEntry = {
      id: existingEntry?.id ?? createJournalEntryId(),
      category: "spirits",
      entryMode,
      brandId: resolvedBrand?.id ?? null,
      spiritItemId: resolvedSpirit.id,
      catalogSource: entrySource,
      name: normalizedName,
      brand: normalizedBrand,
      date: spiritForm.date,
      timeOfDay: spiritForm.timeOfDay,
      spiritType: spiritForm.spiritType,
      ageStatement: spiritForm.ageStatement.trim(),
      proof: spiritForm.proof.trim(),
      mashbill: spiritForm.mashbill.trim(),
      barrelTypeFinish: spiritForm.barrelTypeFinish.trim(),
      batchBarrelNumber: spiritForm.batchBarrelNumber.trim(),
      color: spiritForm.color,
      clarity: spiritForm.clarity,
      legs: spiritForm.legs,
      beading: spiritForm.beading,
      glass: spiritForm.glass,
      aromaComplexity: spiritForm.aromaComplexity,
      aromaNotes: spiritForm.aromaNotes.trim(),
      palateSweetness: spiritForm.palateSweetness,
      palateTexture: spiritForm.palateTexture,
      palateBody: spiritForm.palateBody,
      palateNotes: spiritForm.palateNotes.trim(),
      flavorNotes: spiritForm.flavorNotes,
      finishLength: spiritForm.finishLength,
      finishNotes: spiritForm.finishNotes.trim(),
      pricePaid: spiritForm.pricePaid.trim(),
      drinkStyle: spiritForm.drinkStyle,
      overallImpression: spiritForm.overallImpression.trim(),
      buyAgain: spiritForm.buyAgain,
      quickTags: spiritForm.quickTags,
      isFavorite: existingEntry?.isFavorite ?? false,
      rating: spiritRating,
      suggestedScore: spiritRating,
      createdAt: existingEntry?.createdAt ?? new Date().toISOString()
    };

    setUserCatalog(nextUserCatalog);
    setSpiritEntries((current) =>
      existingEntry ? current.map((item) => (item.id === existingEntry.id ? entry : item)) : [entry, ...current]
    );
    setSelectedSpiritEntryId(entry.id);
    resetSpiritDraft();
    setView(existingEntry ? "detail" : "home");
    setSelectedCategory("spirits");
    setActiveFilter("all");
    setActiveSort("newest");
  }

  const visibleEntries = useMemo(() => {
    let entries: JournalEntry[] = [...pipeEntries, ...cigarEntries, ...spiritEntries];

    if (activeFilter !== "all") {
      entries = entries.filter((entry) => entry.category === activeFilter);
    }

    if (searchValue.trim()) {
      const query = searchValue.trim().toLowerCase();
      entries = entries.filter((entry) => getEntrySearchText(entry).includes(query));
    }

    if (activeSort === "newest") {
      entries.sort((a, b) => (b.date || b.createdAt).localeCompare(a.date || a.createdAt));
    } else if (activeSort === "oldest") {
      entries.sort((a, b) => (a.date || a.createdAt).localeCompare(b.date || b.createdAt));
    } else if (activeSort === "az") {
      entries.sort((a, b) => getEntryDisplayTitle(a).localeCompare(getEntryDisplayTitle(b)));
    } else if (activeSort === "top") {
      entries.sort((a, b) => b.suggestedScore - a.suggestedScore);
    } else if (activeSort === "faves") {
      entries = entries.filter((entry) => entry.isFavorite);
    }

    return entries;
  }, [activeFilter, activeSort, cigarEntries, pipeEntries, searchValue, spiritEntries]);

  return (
    <main className="app-frame">
      <div className="app-shell">
        {view === "home" ? (
          <section className="home-view">
            <header className="home-header">
              <img className="home-logo" src="/LogoFindersLog.png" alt={appConfig.name} />
              <button className="profile-launch-btn" type="button" onClick={() => setView("profile")} aria-label="Open profile and settings">
                <img src="/settingsbtn.png" alt="" />
              </button>
            </header>

            <section className="home-hero">
              <h1 className="home-hero-headline">{appConfig.tagline}</h1>
              <p className="home-hero-body">
                Your personal journal for pipes, cigars, &amp; spirits.
              </p>
            </section>

            <nav className="filter-tabs" aria-label="Categories">
              {homeFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={activeFilter === filter.value ? "filter-tab active" : "filter-tab"}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </nav>

            <div className="home-hero-image" aria-hidden="true" />

            {searchOpen ? (
              <div className="search-panel">
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search blends, brands, notes, tags..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </div>
            ) : null}

            <div className="sort-row" aria-label="Sort options">
              {homeSorts.map((sort) => (
                <button
                  key={sort.value}
                  className={activeSort === sort.value ? "sort-btn active" : "sort-btn"}
                  type="button"
                  onClick={() => setActiveSort(sort.value)}
                >
                  {sort.label}
                </button>
              ))}

              <button
                className="sort-btn sort-icon-btn"
                type="button"
                aria-expanded={searchOpen}
                aria-label="Search entries"
                onClick={() => setSearchOpen((open) => !open)}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {visibleEntries.length ? (
              <section className="entry-list">
                {visibleEntries.map((entry) => (
                  <article key={entry.id} className="entry-card">
                    <div className="entry-card-main">
                      <button
                        className="entry-open-btn"
                        type="button"
                        onClick={() =>
                          entry.category === "pipe"
                            ? openPipeEntryDetail(entry.id)
                            : entry.category === "cigar"
                              ? openCigarEntryDetail(entry.id)
                              : openSpiritEntryDetail(entry.id)
                        }
                      >
                        <span className="entry-badge">
                          <img src={entry.category === "pipe" ? "/pipe.png" : entry.category === "cigar" ? "/cigar.png" : "/whiskey.png"} alt="" />
                        </span>
                        <div className="entry-card-text">
                          <div className="entry-blend">{getEntryDisplayTitle(entry)}</div>
                          <div className="entry-meta">
                            {getEntryMetaLine(entry)}
                          </div>
                        </div>
                      </button>
                    </div>
                    <div className="entry-card-actions">
                      <button
                        className={entry.isFavorite ? "favorite-btn active" : "favorite-btn"}
                        type="button"
                        aria-label={favoriteLabel(entry.isFavorite)}
                        onClick={() =>
                          entry.category === "pipe"
                            ? togglePipeFavorite(entry.id)
                            : entry.category === "cigar"
                              ? toggleCigarFavorite(entry.id)
                              : toggleSpiritFavorite(entry.id)
                        }
                      >
                        <span className="favorite-heart" aria-hidden="true">
                          ♥
                        </span>
                      </button>
                      <div className="entry-score">
                        {entry.suggestedScore.toFixed(1)}
                        <span className="score-denom"> /10</span>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="list-empty">
                <p>
                  {searchValue.trim()
                    ? "No entries match that search yet."
                    : activeSort === "faves"
                      ? "Nothing favorited yet.\nTap ♥ on any entry to save it here."
                      : "Nothing logged yet.\nYour first entry is one session away."}
                </p>
                <button className="empty-btn" type="button" onClick={() => setView("picker")}>
                  + Log Your First Session
                </button>
                {canShowProfileAuth && !authUserId ? (
                  <button className="quiet-link-btn" type="button" onClick={() => setView("profile")}>
                    Back Up Journal
                  </button>
                ) : null}
              </section>
            )}
          </section>
        ) : view === "collection" ? (
          <section className="collection-view">
            <header className="app-header collection-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("home")}
                aria-label="Back to journal"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>My Collection</h2>
              <div className="header-spacer" />
            </header>

            <nav className="collection-tabs" aria-label="Collection rooms">
              {collectionTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={collectionTab === tab.key ? "collection-tab active" : "collection-tab"}
                  type="button"
                  onClick={() => setCollectionTab(tab.key)}
                >
                  {tab.tabLabel}
                </button>
              ))}
            </nav>

            <section className="collection-hero-card">
              <div className="collection-hero-image-wrap">
                <img className="collection-hero-image" src={activeCollectionTab.heroImage} alt="" />
              </div>
              <div className="collection-hero-copy">
                <h1 className="collection-hero-title">{activeCollectionTab.heroTitle}</h1>
                <p className="collection-hero-subtitle">{activeCollectionTab.heroSubtitle}</p>
              </div>
            </section>

            {activeCollectionTab.sections.map((section) => (
              <section key={section.title} className="collection-section-card">
                <div className="collection-section-heading">{section.title}</div>
                <div className="collection-section-rule" aria-hidden="true" />
                {section.title === "Want to Try" ? (
                  <>
                    {(() => {
                      const wishlistKind: CollectionWishlistKind =
                        activeCollectionTab.key === "humidor"
                          ? "cigar"
                          : activeCollectionTab.key === "cellar"
                            ? "pipe"
                            : "bottle";
                      const items = getWishlistItems(wishlistKind);
                      const placeholder =
                        wishlistKind === "cigar"
                          ? "Add a cigar to try"
                          : wishlistKind === "pipe"
                            ? "Add a blend to try"
                            : "Add a bottle to hunt for";

                      return (
                        <>
                          {items.length > 0 ? (
                            <div className="collection-wishlist-list">
                              {items.map((item) => (
                                <div key={item} className="collection-wishlist-chip">
                                  <span>{item}</span>
                                  <button
                                    className="collection-wishlist-del"
                                    type="button"
                                    aria-label={`Remove ${item}`}
                                    onClick={() => removeCollectionWishlistItem(wishlistKind, item)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="collection-empty-copy">{section.emptyCopy}</p>
                          )}

                          <div className="collection-add-row">
                            <input
                              className="collection-add-input"
                              type="text"
                              placeholder={placeholder}
                              value={collectionWishlistInput}
                              onChange={(event) => setCollectionWishlistInput(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  addCollectionWishlistItem(wishlistKind);
                                }
                              }}
                            />
                            <button
                              className="collection-inline-add-btn"
                              type="button"
                              onClick={() => addCollectionWishlistItem(wishlistKind)}
                            >
                              Add
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : activeCollectionTab.key === "humidor" && section.title === "My Cigars" && collectionCigars.length > 0 ? (
                  <div className="collection-item-list">
                    {collectionCigars.map((item) => {
                      const title = [item.brand, item.lineName].filter(Boolean).join(" ");
                      const meta = [item.vitola, item.wrapperShade].filter(Boolean).join(" · ");
                      const sub = `${item.quantity} ${item.quantity === 1 ? "stick" : "sticks"}`;
                      return (
                        <button key={item.id} className="collection-item-card collection-item-button" type="button" onClick={() => openCollectionDetail("cigar", item.id)}>
                          <div className="collection-item-head">
                            <div className="collection-item-title">{title || item.brand}</div>
                            {item.status ? <div className="collection-item-status">{item.status}</div> : null}
                          </div>
                          <div className="collection-item-line">
                            {meta ? <span className="collection-item-meta">{meta}</span> : null}
                            {sub ? <span className="collection-item-sub">{sub}</span> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : activeCollectionTab.key === "cellar" && section.title === "My Tobacco" && collectionTobaccos.length > 0 ? (
                  <div className="collection-item-list">
                    {collectionTobaccos.map((item) => {
                      const meta = [item.brand, item.style, item.cut].filter(Boolean).join(" · ");
                      const qty = `${item.quantity} ${item.quantity === 1 ? "tin" : "tins"}${item.tinDate ? ` · ${item.tinDate}` : ""}`;
                      return (
                        <button key={item.id} className="collection-item-card collection-item-button" type="button" onClick={() => openCollectionDetail("tobacco", item.id)}>
                          <div className="collection-item-head">
                            <div className="collection-item-title">{item.name}</div>
                            {item.status ? <div className="collection-item-status">{item.status}</div> : null}
                          </div>
                          <div className="collection-item-line">
                            {meta ? <span className="collection-item-meta">{meta}</span> : null}
                            {qty ? <span className="collection-item-sub">{qty}</span> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : activeCollectionTab.key === "cellar" && section.title === "My Pipes" && collectionPipes.length > 0 ? (
                  <div className="collection-item-list">
                    {collectionPipes.map((item) => {
                      const meta = [item.maker, item.shape, item.material].filter(Boolean).join(" · ");
                      return (
                        <button key={item.id} className="collection-item-card collection-item-button" type="button" onClick={() => openCollectionDetail("pipe", item.id)}>
                          <div className="collection-item-head">
                            <div className="collection-item-title">{item.name}</div>
                            {item.status ? <div className="collection-item-status">{item.status}</div> : null}
                          </div>
                          <div className="collection-item-line">
                            {meta ? <span className="collection-item-meta">{meta}</span> : null}
                            {item.source ? <span className="collection-item-sub">{item.source}</span> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : activeCollectionTab.key === "bar" && section.title === "My Bottles" && collectionBottles.length > 0 ? (
                  <div className="collection-item-list">
                    {collectionBottles.map((item) => {
                      const meta = [item.distillery, item.spiritType, item.proof].filter(Boolean).join(" · ");
                      return (
                        <button key={item.id} className="collection-item-card collection-item-button" type="button" onClick={() => openCollectionDetail("bottle", item.id)}>
                          <div className="collection-item-head">
                            <div className="collection-item-title">{item.name}</div>
                            {item.status ? <div className="collection-item-status">{item.status}</div> : null}
                          </div>
                          <div className="collection-item-line">
                            {meta ? <span className="collection-item-meta">{meta}</span> : null}
                            {item.age ? <span className="collection-item-sub">{item.age}</span> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="collection-empty-copy">{section.emptyCopy}</p>
                )}
                {section.title !== "Want to Try" ? (
                  <button
                    className="collection-add-btn"
                    type="button"
                    onClick={() => {
                      if (section.actionKind === "cigar") return openAddCollectionCigar();
                      if (section.actionKind === "tobacco") return openAddCollectionTobacco();
                      if (section.actionKind === "pipe") return openAddCollectionPipe();
                      if (section.actionKind === "bottle") return openAddCollectionBottle();
                      return openCollectionAdd(section.actionCategory);
                    }}
                  >
                    <span className="collection-add-plus">+</span>
                    {section.actionLabel}
                  </button>
                ) : null}
              </section>
            ))}
          </section>
        ) : view === "collectionDetail" && selectedCollectionDetailKind === "cigar" && selectedCollectionCigar ? (
          <section className="detail-view">
            <header className="app-header">
              <button className="back-img-btn" type="button" onClick={() => setView("collection")} aria-label="Back to collection">
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Humidor Cigar</h2>
              <div className="header-action-group">
                <button className="header-action-btn" type="button" onClick={() => startEditingCollectionCigar(selectedCollectionCigar)}>
                  Edit
                </button>
              </div>
            </header>

            <section className="detail-hero">
              <div className="detail-kicker">{selectedCollectionCigar.brand || "My Collection"}</div>
              <h1 className="detail-title">{selectedCollectionCigar.lineName || selectedCollectionCigar.brand}</h1>
            </section>

            <section className="form-section detail-section">
              <div className="section-title"><img className="section-title-icon" src="/cigar.png" alt="" />The Cigar</div>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Brand</span><span className="detail-value">{selectedCollectionCigar.brand || "Not logged"}</span></div>
                <div className="detail-item"><span className="detail-label">Line / Name</span><span className="detail-value">{selectedCollectionCigar.lineName || "Not logged"}</span></div>
                {selectedCollectionCigar.vitola ? <div className="detail-item"><span className="detail-label">Vitola / Size</span><span className="detail-value">{selectedCollectionCigar.vitola}</span></div> : null}
                {selectedCollectionCigar.wrapperShade ? <div className="detail-item"><span className="detail-label">Wrapper Shade</span><span className="detail-value">{selectedCollectionCigar.wrapperShade}</span></div> : null}
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title"><img className="section-title-icon" src="/cigar.png" alt="" />Humidor Notes</div>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Date Added</span><span className="detail-value">{formatJournalDate(selectedCollectionCigar.dateAdded) || "Not logged"}</span></div>
                <div className="detail-item"><span className="detail-label">Quantity</span><span className="detail-value">{selectedCollectionCigar.quantity} {selectedCollectionCigar.quantity === 1 ? "stick" : "sticks"}</span></div>
                {selectedCollectionCigar.status ? <div className="detail-item"><span className="detail-label">Status</span><span className="detail-value">{selectedCollectionCigar.status}</span></div> : null}
              </div>
              {selectedCollectionCigar.notes ? <div className="detail-notes"><div className="detail-note-block"><div className="detail-label">Notes</div><p>{selectedCollectionCigar.notes}</p></div></div> : null}
            </section>
          </section>
        ) : view === "collectionDetail" && selectedCollectionDetailKind === "tobacco" && selectedCollectionTobacco ? (
          <section className="detail-view">
            <header className="app-header">
              <button className="back-img-btn" type="button" onClick={() => setView("collection")} aria-label="Back to collection">
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Cellar Tobacco</h2>
              <div className="header-action-group">
                <button className="header-action-btn" type="button" onClick={() => startEditingCollectionTobacco(selectedCollectionTobacco)}>
                  Edit
                </button>
              </div>
            </header>

            <section className="detail-hero">
              <div className="detail-kicker">{selectedCollectionTobacco.brand || "My Collection"}</div>
              <h1 className="detail-title">{selectedCollectionTobacco.name}</h1>
            </section>

            <section className="form-section detail-section">
              <div className="section-title"><img className="section-title-icon" src="/pipe.png" alt="" />The Tobacco</div>
              <div className="detail-grid">
                {selectedCollectionTobacco.brand ? <div className="detail-item"><span className="detail-label">Brand / Blender</span><span className="detail-value">{selectedCollectionTobacco.brand}</span></div> : null}
                {selectedCollectionTobacco.style ? <div className="detail-item"><span className="detail-label">Style / Family</span><span className="detail-value">{selectedCollectionTobacco.style}</span></div> : null}
                {selectedCollectionTobacco.cut ? <div className="detail-item"><span className="detail-label">Cut</span><span className="detail-value">{selectedCollectionTobacco.cut}</span></div> : null}
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title"><img className="section-title-icon" src="/pipe.png" alt="" />Cellar Notes</div>
              <div className="detail-grid">
                {selectedCollectionTobacco.dateAcquired ? <div className="detail-item"><span className="detail-label">Date Acquired</span><span className="detail-value">{formatJournalDate(selectedCollectionTobacco.dateAcquired)}</span></div> : null}
                {selectedCollectionTobacco.tinDate ? <div className="detail-item"><span className="detail-label">Tin Date / Year</span><span className="detail-value">{selectedCollectionTobacco.tinDate}</span></div> : null}
                <div className="detail-item"><span className="detail-label">Quantity on Hand</span><span className="detail-value">{selectedCollectionTobacco.quantity} {selectedCollectionTobacco.quantity === 1 ? "tin" : "tins"}</span></div>
                {selectedCollectionTobacco.storageFormat ? <div className="detail-item"><span className="detail-label">Storage Format</span><span className="detail-value">{selectedCollectionTobacco.storageFormat}</span></div> : null}
                {selectedCollectionTobacco.source ? <div className="detail-item"><span className="detail-label">Source</span><span className="detail-value">{selectedCollectionTobacco.source}</span></div> : null}
                {selectedCollectionTobacco.status ? <div className="detail-item"><span className="detail-label">Status</span><span className="detail-value">{selectedCollectionTobacco.status}</span></div> : null}
                {selectedCollectionTobacco.discontinued ? <div className="detail-item"><span className="detail-label">Discontinued Blend</span><span className="detail-value">Yes</span></div> : null}
              </div>
              {selectedCollectionTobacco.notes ? <div className="detail-notes"><div className="detail-note-block"><div className="detail-label">Cellar Notes</div><p>{selectedCollectionTobacco.notes}</p></div></div> : null}
            </section>
          </section>
        ) : view === "collectionDetail" && selectedCollectionDetailKind === "pipe" && selectedCollectionPipe ? (
          <section className="detail-view">
            <header className="app-header">
              <button className="back-img-btn" type="button" onClick={() => setView("collection")} aria-label="Back to collection">
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Rack Pipe</h2>
              <div className="header-action-group">
                <button className="header-action-btn" type="button" onClick={() => startEditingCollectionPipe(selectedCollectionPipe)}>
                  Edit
                </button>
              </div>
            </header>

            <section className="detail-hero">
              <div className="detail-kicker">{selectedCollectionPipe.maker || "My Collection"}</div>
              <h1 className="detail-title">{selectedCollectionPipe.name}</h1>
            </section>

            <section className="form-section detail-section">
              <div className="section-title"><img className="section-title-icon" src="/pipe.png" alt="" />The Pipe</div>
              <div className="detail-grid">
                {selectedCollectionPipe.maker ? <div className="detail-item"><span className="detail-label">Maker</span><span className="detail-value">{selectedCollectionPipe.maker}</span></div> : null}
                {selectedCollectionPipe.shape ? <div className="detail-item"><span className="detail-label">Shape</span><span className="detail-value">{selectedCollectionPipe.shape}</span></div> : null}
                {selectedCollectionPipe.material ? <div className="detail-item"><span className="detail-label">Material</span><span className="detail-value">{selectedCollectionPipe.material}</span></div> : null}
                {selectedCollectionPipe.finish ? <div className="detail-item"><span className="detail-label">Finish</span><span className="detail-value">{selectedCollectionPipe.finish}</span></div> : null}
                {selectedCollectionPipe.stem ? <div className="detail-item"><span className="detail-label">Stem</span><span className="detail-value">{selectedCollectionPipe.stem}</span></div> : null}
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title"><img className="section-title-icon" src="/pipe.png" alt="" />Rack Notes</div>
              <div className="detail-grid">
                {selectedCollectionPipe.dateAcquired ? <div className="detail-item"><span className="detail-label">Date Acquired</span><span className="detail-value">{formatJournalDate(selectedCollectionPipe.dateAcquired)}</span></div> : null}
                {selectedCollectionPipe.status ? <div className="detail-item"><span className="detail-label">Status</span><span className="detail-value">{selectedCollectionPipe.status}</span></div> : null}
                {selectedCollectionPipe.source ? <div className="detail-item"><span className="detail-label">Source</span><span className="detail-value">{selectedCollectionPipe.source}</span></div> : null}
              </div>
              {selectedCollectionPipe.notes ? <div className="detail-notes"><div className="detail-note-block"><div className="detail-label">Notes</div><p>{selectedCollectionPipe.notes}</p></div></div> : null}
            </section>
          </section>
        ) : view === "collectionDetail" && selectedCollectionDetailKind === "bottle" && selectedCollectionBottle ? (
          <section className="detail-view">
            <header className="app-header">
              <button className="back-img-btn" type="button" onClick={() => setView("collection")} aria-label="Back to collection">
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Bar Bottle</h2>
              <div className="header-action-group">
                <button className="header-action-btn" type="button" onClick={() => startEditingCollectionBottle(selectedCollectionBottle)}>
                  Edit
                </button>
              </div>
            </header>

            <section className="detail-hero">
              <div className="detail-kicker">{selectedCollectionBottle.distillery || "My Collection"}</div>
              <h1 className="detail-title">{selectedCollectionBottle.name}</h1>
            </section>

            <section className="form-section detail-section">
              <div className="section-title"><img className="section-title-icon" src="/whiskey.png" alt="" />The Bottle</div>
              <div className="detail-grid">
                {selectedCollectionBottle.distillery ? <div className="detail-item"><span className="detail-label">Distillery</span><span className="detail-value">{selectedCollectionBottle.distillery}</span></div> : null}
                {selectedCollectionBottle.spiritType ? <div className="detail-item"><span className="detail-label">Spirit Type</span><span className="detail-value">{selectedCollectionBottle.spiritType}</span></div> : null}
                {selectedCollectionBottle.proof ? <div className="detail-item"><span className="detail-label">Proof / ABV</span><span className="detail-value">{selectedCollectionBottle.proof}</span></div> : null}
                {selectedCollectionBottle.age ? <div className="detail-item"><span className="detail-label">Age</span><span className="detail-value">{selectedCollectionBottle.age}</span></div> : null}
                {selectedCollectionBottle.status ? <div className="detail-item"><span className="detail-label">Status</span><span className="detail-value">{selectedCollectionBottle.status}</span></div> : null}
              </div>
              {selectedCollectionBottle.notes ? <div className="detail-notes"><div className="detail-note-block"><div className="detail-label">Notes</div><p>{selectedCollectionBottle.notes}</p></div></div> : null}
            </section>
          </section>
        ) : view === "collectionForm" ? (
          <section className="form-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView(selectedCollectionDetailId && ((collectionFormKind === "cigar" && editingCollectionCigarId) || (collectionFormKind === "tobacco" && editingCollectionTobaccoId) || (collectionFormKind === "pipe" && editingCollectionPipeId) || (collectionFormKind === "bottle" && editingCollectionBottleId)) ? "collectionDetail" : "collection")}
                aria-label="Back to collection"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>
                {collectionFormKind === "cigar"
                  ? editingCollectionCigarId
                    ? "Edit Cigar"
                    : "Add a Cigar"
                  : collectionFormKind === "tobacco"
                    ? editingCollectionTobaccoId
                      ? "Edit Tobacco"
                      : "Add a Tobacco"
                    : collectionFormKind === "pipe"
                      ? editingCollectionPipeId
                        ? "Edit Pipe"
                        : "Add a Pipe"
                      : editingCollectionBottleId
                        ? "Edit Bottle"
                        : "Add a Bottle"}
              </h2>
              <div className="header-spacer" />
            </header>

            {collectionFormKind === "cigar" ? (
              <>
                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/cigar.png" alt="" />
                    The Cigar
                  </div>

                  <CatalogAutocompleteField
                    label="Brand"
                    required
                    value={collectionCigarForm.brand}
                    placeholder="e.g. Padron, Arturo Fuente, Davidoff"
                    suggestions={collectionCigarBrandSuggestions}
                    emptyActionLabel={
                      collectionCigarForm.brand.trim() ? `Add "${collectionCigarForm.brand.trim()}" to your cigar brands` : undefined
                    }
                    onChange={(value) => updateCollectionCigarField("brand", value)}
                    onSelect={(suggestion) => {
                      updateCollectionCigarField("brand", suggestion.label);
                      if (!collectionCigarForm.lineName.trim()) return;
                      const brand = catalogService.findBrandByExactName(catalogStore, "cigars", suggestion.label);
                      const existing = catalogService.findItemByExactName(
                        catalogStore,
                        "cigars",
                        collectionCigarForm.lineName,
                        brand?.id ?? undefined
                      );
                      if (existing) {
                        updateCollectionCigarField("lineName", existing.name);
                        applyCollectionCigarMetadata(existing);
                      }
                    }}
                    onCreateCustom={(value) => updateCollectionCigarField("brand", value)}
                  />

                  <CatalogAutocompleteField
                    label="Line / Name"
                    value={collectionCigarForm.lineName}
                    placeholder="e.g. 1964 Anniversary, Hemingway, Serie D No. 4"
                    suggestions={collectionCigarLineSuggestions}
                    emptyActionLabel={
                      collectionCigarForm.lineName.trim()
                        ? `Use "${collectionCigarForm.lineName.trim()}" for this humidor cigar`
                        : undefined
                    }
                    onChange={(value) => updateCollectionCigarField("lineName", value)}
                    onSelect={(suggestion) => {
                      const item = catalogService.getItemById(catalogStore, suggestion.id);
                      if (!item) {
                        updateCollectionCigarField("lineName", suggestion.label);
                        return;
                      }
                      updateCollectionCigarField("lineName", item.name);
                      if (item.brandId) {
                        const brand = catalogService.getBrandById(catalogStore, item.brandId);
                        if (brand) {
                          updateCollectionCigarField("brand", brand.name);
                        }
                      }
                      applyCollectionCigarMetadata(item);
                    }}
                    onCreateCustom={(value) => updateCollectionCigarField("lineName", value)}
                  />

                  <div className="field">
                    <label>Vitola / Size</label>
                    <div className="pill-options">
                      {collectionCigarVitolaOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionCigarForm.vitola === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionCigarField("vitola", toggleSingleChoice(collectionCigarForm.vitola, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Wrapper Shade</label>
                    <div className="pill-options">
                      {collectionCigarWrapperShadeOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionCigarForm.wrapperShade === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionCigarField("wrapperShade", toggleSingleChoice(collectionCigarForm.wrapperShade, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/cigar.png" alt="" />
                    Humidor Notes
                  </div>

                  <div className="field">
                    <label>Date Added to Humidor</label>
                    <input
                      type="date"
                      value={collectionCigarForm.dateAdded}
                      onChange={(event) => updateCollectionCigarField("dateAdded", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Quantity</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 1, 5, 20"
                      value={collectionCigarForm.quantity}
                      onChange={(event) => updateCollectionCigarField("quantity", event.target.value.replace(/[^\d]/g, ""))}
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <div className="pill-options">
                      {collectionCigarStatusOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionCigarForm.status === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionCigarField("status", toggleSingleChoice(collectionCigarForm.status, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Notes</label>
                    <textarea
                      placeholder="Humidor condition, where you found it, or anything worth remembering..."
                      value={collectionCigarForm.notes}
                      onChange={(event) => updateCollectionCigarField("notes", event.target.value)}
                    />
                  </div>
                </section>

                <button className="save-btn" type="button" onClick={saveCollectionCigar}>
                  {editingCollectionCigarId ? "Save Changes" : "Save Cigar"}
                </button>
              </>
            ) : collectionFormKind === "tobacco" ? (
              <>
                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/pipe.png" alt="" />
                    The Tobacco
                  </div>

                  <CatalogAutocompleteField
                    label="Brand / Blender"
                    value={collectionTobaccoForm.brand}
                    placeholder="e.g. Esoterica, Samuel Gawith, C&D"
                    suggestions={collectionTobaccoBrandSuggestions}
                    emptyActionLabel={
                      collectionTobaccoForm.brand.trim() ? `Add "${collectionTobaccoForm.brand.trim()}" to your tobacco brands` : undefined
                    }
                    onChange={(value) => updateCollectionTobaccoField("brand", value)}
                    onSelect={(suggestion) => updateCollectionTobaccoField("brand", suggestion.label)}
                    onCreateCustom={(value) => updateCollectionTobaccoField("brand", value)}
                  />

                  <CatalogAutocompleteField
                    label="Blend Name"
                    required
                    value={collectionTobaccoForm.name}
                    placeholder="e.g. Penzance, Nightcap, Quiet Nights"
                    suggestions={collectionTobaccoNameSuggestions}
                    emptyActionLabel={
                      collectionTobaccoForm.name.trim() ? `Use "${collectionTobaccoForm.name.trim()}" in your cellar` : undefined
                    }
                    onChange={(value) => updateCollectionTobaccoField("name", value)}
                    onSelect={(suggestion) => {
                      const item = catalogService.getItemById(catalogStore, suggestion.id);
                      if (!item) return updateCollectionTobaccoField("name", suggestion.label);
                      updateCollectionTobaccoField("name", item.name);
                      if (item.brandId) {
                        const brand = catalogService.getBrandById(catalogStore, item.brandId);
                        if (brand) updateCollectionTobaccoField("brand", brand.name);
                      }
                      const metadata = item.metadata as PipeTobaccoMetadata;
                      if (metadata.blendFamily) updateCollectionTobaccoField("style", metadata.blendFamily);
                      if (metadata.cutType) updateCollectionTobaccoField("cut", metadata.cutType);
                    }}
                    onCreateCustom={(value) => updateCollectionTobaccoField("name", value)}
                  />

                  <div className="field">
                    <label>Style / Family</label>
                    <div className="pill-options">
                      {collectionTobaccoStyleOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionTobaccoForm.style === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionTobaccoField("style", toggleSingleChoice(collectionTobaccoForm.style, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Cut</label>
                    <div className="pill-options">
                      {collectionTobaccoCutOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionTobaccoForm.cut === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionTobaccoField("cut", toggleSingleChoice(collectionTobaccoForm.cut, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/pipe.png" alt="" />
                    Cellar Notes
                  </div>

                  <div className="field">
                    <label>Date Acquired</label>
                    <input
                      type="date"
                      value={collectionTobaccoForm.dateAcquired}
                      onChange={(event) => updateCollectionTobaccoField("dateAcquired", event.target.value)}
                    />
                  </div>

                  <div className="field collection-callout-field">
                    <div className="collection-toggle-card">
                      <div className="collection-toggle-copy">
                        <strong>Discontinued Blend</strong>
                        <small>Limited runs, old vintages, and vanished tins deserve a clear flag in the cellar.</small>
                      </div>

                      <label className="toggle-label-row collection-toggle-row">
                        <span className="collection-toggle-state">{collectionTobaccoForm.discontinued ? "Marked" : "Mark It"}</span>
                        <input
                          type="checkbox"
                          checked={collectionTobaccoForm.discontinued}
                          onChange={(event) => updateCollectionTobaccoField("discontinued", event.target.checked)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="field">
                    <label>Tin Date / Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2019"
                      value={collectionTobaccoForm.tinDate}
                      onChange={(event) => updateCollectionTobaccoField("tinDate", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Quantity on Hand</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 1, 4, 12"
                      value={collectionTobaccoForm.quantity}
                      onChange={(event) => updateCollectionTobaccoField("quantity", event.target.value.replace(/[^\d]/g, ""))}
                    />
                  </div>

                  <div className="field">
                    <label>Storage Format</label>
                    <div className="pill-options">
                      {collectionTobaccoStorageOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionTobaccoForm.storageFormat === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionTobaccoField("storageFormat", toggleSingleChoice(collectionTobaccoForm.storageFormat, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Source</label>
                    <input
                      type="text"
                      placeholder="e.g. SmokingPipes.com"
                      value={collectionTobaccoForm.source}
                      onChange={(event) => updateCollectionTobaccoField("source", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <div className="pill-options">
                      {collectionTobaccoStatusOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionTobaccoForm.status === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionTobaccoField("status", toggleSingleChoice(collectionTobaccoForm.status, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Cellar Notes</label>
                    <textarea
                      placeholder="Tin condition, aging observations, or why you're hanging onto it..."
                      value={collectionTobaccoForm.notes}
                      onChange={(event) => updateCollectionTobaccoField("notes", event.target.value)}
                    />
                  </div>
                </section>

                <button className="save-btn" type="button" onClick={saveCollectionTobacco}>
                  {editingCollectionTobaccoId ? "Save Changes" : "Save Tobacco"}
                </button>
              </>
            ) : collectionFormKind === "pipe" ? (
              <>
                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/pipe.png" alt="" />
                    The Pipe
                  </div>

                  <CatalogAutocompleteField
                    label="Pipe Name"
                    required
                    value={collectionPipeForm.name}
                    placeholder="e.g. Peterson 999, Savinelli 316 KS"
                    suggestions={collectionPipeSuggestions}
                    emptyActionLabel={
                      collectionPipeForm.name.trim() ? `Use "${collectionPipeForm.name.trim()}" in your rack` : undefined
                    }
                    onChange={(value) => updateCollectionPipeField("name", value)}
                    onSelect={(suggestion) => {
                      const item = catalogService.getItemById(catalogStore, suggestion.id);
                      if (!item) return updateCollectionPipeField("name", suggestion.label);
                      const displayName = catalogService.getCatalogItemDisplayName(catalogStore, item);
                      const brandName = catalogService.getBrandById(catalogStore, item.brandId)?.name ?? "";
                      updateCollectionPipeField("name", displayName);
                      if (brandName) updateCollectionPipeField("maker", brandName);
                      const metadata = item.metadata as PipeMetadata;
                      if (metadata.shape) updateCollectionPipeField("shape", metadata.shape);
                      if (metadata.material) updateCollectionPipeField("material", metadata.material);
                      if (metadata.finish) updateCollectionPipeField("finish", metadata.finish);
                    }}
                    onCreateCustom={(value) => updateCollectionPipeField("name", value)}
                  />

                  <div className="field">
                    <label>Maker</label>
                    <input
                      type="text"
                      placeholder="e.g. Peterson, Savinelli"
                      value={collectionPipeForm.maker}
                      onChange={(event) => updateCollectionPipeField("maker", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Shape</label>
                    <div className="pill-options">
                      {collectionPipeShapeOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionPipeForm.shape === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionPipeField("shape", toggleSingleChoice(collectionPipeForm.shape, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Material</label>
                    <div className="pill-options">
                      {collectionPipeMaterialOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionPipeForm.material === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionPipeField("material", toggleSingleChoice(collectionPipeForm.material, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Finish</label>
                    <div className="pill-options">
                      {collectionPipeFinishOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionPipeForm.finish === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionPipeField("finish", toggleSingleChoice(collectionPipeForm.finish, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Stem</label>
                    <div className="pill-options">
                      {collectionPipeStemOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionPipeForm.stem === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionPipeField("stem", toggleSingleChoice(collectionPipeForm.stem, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/pipe.png" alt="" />
                    Rack Notes
                  </div>

                  <div className="field">
                    <label>Date Acquired</label>
                    <input
                      type="date"
                      value={collectionPipeForm.dateAcquired}
                      onChange={(event) => updateCollectionPipeField("dateAcquired", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <div className="pill-options">
                      {collectionPipeStatusOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionPipeForm.status === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionPipeField("status", toggleSingleChoice(collectionPipeForm.status, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Source</label>
                    <input
                      type="text"
                      placeholder="e.g. Estate sale, Smokingpipes, local shop"
                      value={collectionPipeForm.source}
                      onChange={(event) => updateCollectionPipeField("source", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Notes</label>
                    <textarea
                      placeholder="Condition, restoration notes, or what makes this one special..."
                      value={collectionPipeForm.notes}
                      onChange={(event) => updateCollectionPipeField("notes", event.target.value)}
                    />
                  </div>
                </section>

                <button className="save-btn" type="button" onClick={saveCollectionPipe}>
                  {editingCollectionPipeId ? "Save Changes" : "Save Pipe"}
                </button>
              </>
            ) : (
              <>
                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/whiskey.png" alt="" />
                    The Bottle
                  </div>

                  <CatalogAutocompleteField
                    label="Name / Expression"
                    required
                    value={collectionBottleForm.name}
                    placeholder="e.g. Eagle Rare 10, Lagavulin 16"
                    suggestions={collectionBottleNameSuggestions}
                    emptyActionLabel={
                      collectionBottleForm.name.trim() ? `Use "${collectionBottleForm.name.trim()}" in your bar` : undefined
                    }
                    onChange={(value) => updateCollectionBottleField("name", value)}
                    onSelect={(suggestion) => {
                      const item = catalogService.getItemById(catalogStore, suggestion.id);
                      if (!item) return updateCollectionBottleField("name", suggestion.label);
                      updateCollectionBottleField("name", item.name);
                      if (item.brandId) {
                        const brand = catalogService.getBrandById(catalogStore, item.brandId);
                        if (brand) updateCollectionBottleField("distillery", brand.name);
                      }
                      const metadata = item.metadata as SpiritMetadata;
                      if (metadata.spiritType) updateCollectionBottleField("spiritType", metadata.spiritType);
                      if (metadata.proof) updateCollectionBottleField("proof", String(metadata.proof));
                      if (metadata.ageStatement) updateCollectionBottleField("age", metadata.ageStatement);
                    }}
                    onCreateCustom={(value) => updateCollectionBottleField("name", value)}
                  />

                  <CatalogAutocompleteField
                    label="Distillery / Producer"
                    value={collectionBottleForm.distillery}
                    placeholder="e.g. Buffalo Trace, Wild Turkey"
                    suggestions={collectionBottleBrandSuggestions}
                    emptyActionLabel={
                      collectionBottleForm.distillery.trim()
                        ? `Add "${collectionBottleForm.distillery.trim()}" to your spirit brands`
                        : undefined
                    }
                    onChange={(value) => updateCollectionBottleField("distillery", value)}
                    onSelect={(suggestion) => updateCollectionBottleField("distillery", suggestion.label)}
                    onCreateCustom={(value) => updateCollectionBottleField("distillery", value)}
                  />

                  <div className="field">
                    <label>Spirit Type</label>
                    <div className="pill-options">
                      {spiritTypeOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionBottleForm.spiritType === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionBottleField("spiritType", toggleSingleChoice(collectionBottleForm.spiritType, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Proof / ABV</label>
                    <input
                      type="text"
                      placeholder="e.g. 90 proof"
                      value={collectionBottleForm.proof}
                      onChange={(event) => updateCollectionBottleField("proof", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Age Statement</label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Years, NAS"
                      value={collectionBottleForm.age}
                      onChange={(event) => updateCollectionBottleField("age", event.target.value)}
                    />
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/whiskey.png" alt="" />
                    Bar Notes
                  </div>

                  <div className="field">
                    <label>Bottle Status</label>
                    <div className="pill-options">
                      {collectionBottleStatusOptions.map((option) => (
                        <button
                          key={option}
                          className={collectionBottleForm.status === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateCollectionBottleField("status", toggleSingleChoice(collectionBottleForm.status, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Notes</label>
                    <textarea
                      placeholder="How you landed it, what it is for, or any bottle notes..."
                      value={collectionBottleForm.notes}
                      onChange={(event) => updateCollectionBottleField("notes", event.target.value)}
                    />
                  </div>
                </section>

                <button className="save-btn" type="button" onClick={saveCollectionBottle}>
                  {editingCollectionBottleId ? "Save Changes" : "Save Bottle"}
                </button>
              </>
            )}
          </section>
        ) : view === "profile" ? (
          <section className="profile-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("home")}
                aria-label="Back to journal"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Profile</h2>
              <div className="header-spacer" />
            </header>

            <section className="profile-hero">
              <div className="profile-kicker">{authUserId ? "Your Profile" : "Account"}</div>
              <h1 className="profile-title">{authUserId ? "Your profile" : "Sign in to your profile"}</h1>
              <p className="profile-copy">
                {authUserId
                  ? "Your journal is saved to your profile and can follow you across devices."
                  : journalEntryCount > 0
                    ? "These entries are saved on this device. Sign in to move them into your profile."
                    : "Use your profile to save your journal and access it across devices."}
              </p>
            </section>

            <section className="profile-stats">
              <article className="profile-stat-card">
                <div className="profile-stat-value">{journalEntryCount}</div>
                <div className="profile-stat-label">{authUserId ? "Journal Entries" : "Device Entries"}</div>
              </article>
              <article className="profile-stat-card">
                <div className="profile-stat-value">{favoriteCount}</div>
                <div className="profile-stat-label">Favorites</div>
              </article>
              <article className="profile-stat-card">
                <div className="profile-stat-value">{personalCatalogCount}</div>
                <div className="profile-stat-label">Catalog Adds</div>
              </article>
            </section>

            <section className="cloud-strip profile-cloud-strip">
              {authUserId ? (
                <div className="profile-account-panel">
                  <div className="profile-account-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{authUserEmail ?? "Profile connected"}</span>
                  </div>
                  <div className="profile-account-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">Signed in</span>
                  </div>
                  <button
                    className="cloud-primary-btn"
                    type="button"
                    onClick={() => void saveDeviceJournalToProfile()}
                    disabled={authBusy}
                  >
                    {authBusy ? "Saving..." : "Save This Device's Journal to Profile"}
                  </button>
                </div>
              ) : (
                <div className="profile-auth-panel">
                  {journalEntryCount > 0 ? (
                    <div className="cloud-strip-note">
                      Sign in on this device to add these entries to your profile.
                    </div>
                  ) : null}
                  {socialAuthProviders.map((provider) => (
                    <button
                      key={provider.provider}
                      className="social-auth-btn"
                      type="button"
                      onClick={() => void signInWithProvider(provider.provider)}
                      disabled={authBusy}
                    >
                      <span className="social-auth-mark">{provider.mark}</span>
                      {provider.label}
                    </button>
                  ))}
                  <div className="auth-divider">or continue with email</div>
                  <input
                    className="cloud-email-input"
                    type="email"
                    placeholder="Email address"
                    value={authEmailInput}
                    onChange={(event) => setAuthEmailInput(event.target.value)}
                  />
                  <button className="cloud-primary-btn" type="button" onClick={() => void sendMagicLink()} disabled={authBusy}>
                    {authBusy ? "Sending..." : "Send Sign-In Link"}
                  </button>
                </div>
              )}

              {authNotice ? <div className="cloud-strip-note">{authNotice}</div> : null}
            </section>

            <section className="form-section profile-section">
              <div className="section-title">
                <img className="section-title-icon" src="/settingsbtn.png" alt="" />
                Account
              </div>
              <div className="profile-settings-list">
                <div className="profile-setting-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{authUserId ? authUserEmail ?? "Profile connected" : "Not signed in"}</span>
                </div>
                <div className="profile-setting-row">
                  <span className="detail-label">Journal</span>
                  <span className="detail-value">{authUserId ? "Saved to your profile" : "Saved locally on this device"}</span>
                </div>
                <div className="profile-setting-row">
                  <span className="detail-label">Settings</span>
                  <span className="detail-value">Preferences coming soon</span>
                </div>
              </div>
            </section>

            {authUserId ? (
              <section className="profile-signout-section">
                <button className="cloud-secondary-btn" type="button" onClick={() => void signOutOfCloud()} disabled={authBusy}>
                  {authBusy ? "Working..." : "Sign Out"}
                </button>
              </section>
            ) : null}
          </section>
        ) : view === "picker" ? (
          <section className="picker-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("home")}
                aria-label="Back to journal"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>New Session</h2>
              <div className="header-spacer" />
            </header>

            <div className="picker-intro">What are you logging today?</div>

            {pickerItems.map((item) => (
              <button
                key={item.key}
                className="picker-card"
                type="button"
                onClick={() => openNewSession(item.key)}
              >
                <div className="picker-emoji">
                  <img src={item.image} alt="" />
                </div>
                <div>
                  <div className="picker-label">{item.label}</div>
                  <div className="picker-sub">{item.sub}</div>
                </div>
                <div className="picker-arrow">›</div>
              </button>
            ))}
          </section>
        ) : view === "detail" && selectedPipeEntry && selectedCategory === "pipe" ? (
          <section className="detail-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("home")}
                aria-label="Back to journal"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Pipe Session</h2>
              <div className="header-action-group">
                <button
                  className={selectedPipeEntry.isFavorite ? "header-icon-btn active" : "header-icon-btn"}
                  type="button"
                  aria-label={favoriteLabel(selectedPipeEntry.isFavorite)}
                  onClick={() => togglePipeFavorite(selectedPipeEntry.id)}
                >
                  <span className={selectedPipeEntry.isFavorite ? "detail-favorite-heart active" : "detail-favorite-heart"} aria-hidden="true">
                    ♥
                  </span>
                </button>
                <button className="header-action-btn" type="button" onClick={() => startEditingPipeEntry(selectedPipeEntry)}>
                  Edit
                </button>
              </div>
            </header>

            {!selectedPipeEntryIsFull ? (
              <section className="detail-upgrade-strip">
                <span>Want more detail here?</span>
                <button className="inline-upgrade-btn" type="button" onClick={() => startEditingPipeEntry(selectedPipeEntry, true)}>
                  Make It A Full Entry
                </button>
              </section>
            ) : null}

            <section className="detail-hero">
              <div className="detail-kicker">{selectedPipeEntry.brand || "Pipe Journal"}</div>
              <h1 className="detail-title">{selectedPipeEntry.blendName}</h1>
              <div className="detail-score">
                {selectedPipeEntry.suggestedScore.toFixed(1)}
                <span> /10</span>
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/pipe.png" alt="" />
                The Session
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatJournalDate(selectedPipeEntry.date) || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time of Day</span>
                  <span className="detail-value">{selectedPipeEntry.timeOfDay || "Not logged"}</span>
                </div>
                {selectedPipeEntry.setting ? (
                  <div className="detail-item">
                    <span className="detail-label">Setting</span>
                    <span className="detail-value">{selectedPipeEntry.setting}</span>
                  </div>
                ) : null}
                {selectedPipeEntry.location ? (
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{selectedPipeEntry.location}</span>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/pipe.png" alt="" />
                The Blend
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Brand</span>
                  <span className="detail-value">{selectedPipeEntry.brand || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Style</span>
                  <span className="detail-value">{selectedPipeEntry.blendType || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cut</span>
                  <span className="detail-value">{selectedPipeEntry.cutType || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Strength</span>
                  <span className="detail-value">{selectedPipeEntry.nicotineStrength || "Not logged"}</span>
                </div>
              </div>
              {selectedPipeEntry.components.length ? (
                <div className="detail-tags">
                  {selectedPipeEntry.components.map((component) => (
                    <span key={component} className="detail-tag">
                      {component}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/pipe.png" alt="" />
                Equipment
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Pipe Used</span>
                  <span className="detail-value">{selectedPipeEntry.pipeUsed || "Not logged"}</span>
                </div>
                {selectedPipeEntry.lighterUsed ? (
                  <div className="detail-item">
                    <span className="detail-label">Lighter Used</span>
                    <span className="detail-value">{selectedPipeEntry.lighterUsed}</span>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/pipe.png" alt="" />
                Ratings
              </div>
              <div className="detail-ratings">
                {([
                  ["Flavor", selectedPipeEntry.ratings.flavor],
                  ["Strength", selectedPipeEntry.ratings.strength],
                  ["Room Note", selectedPipeEntry.ratings.roomNote],
                  ["Performance", selectedPipeEntry.ratings.performance],
                  ["Enjoyment", selectedPipeEntry.ratings.enjoyment],
                  ["Tin", selectedPipeEntry.ratings.tin],
                  ["Mechanics", selectedPipeEntry.ratings.mechanics]
                ] as Array<[string, number]>)
                  .filter(([, value]) => value > 0)
                  .map(([label, value]) => (
                    <div key={label} className="detail-rating-row">
                      <span className="detail-label">{label}</span>
                      <span className="detail-value">{value}/10</span>
                    </div>
                  ))}
              </div>
            </section>

            {(selectedPipeEntry.quickNotes ||
              selectedPipeEntry.firstThirdNotes ||
              selectedPipeEntry.middleThirdNotes ||
              selectedPipeEntry.finalThirdNotes ||
              selectedPipeEntry.tinNotes ||
              selectedPipeEntry.prepNotes) ? (
              <section className="form-section detail-section">
                <div className="section-title">
                  <img className="section-title-icon" src="/pipe.png" alt="" />
                  Notes
                </div>
                <div className="detail-notes">
                  {selectedPipeEntry.quickNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Quick Notes</div>
                      <p>{selectedPipeEntry.quickNotes}</p>
                    </div>
                  ) : null}
                  {selectedPipeEntry.firstThirdNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">First Third</div>
                      <p>{selectedPipeEntry.firstThirdNotes}</p>
                    </div>
                  ) : null}
                  {selectedPipeEntry.middleThirdNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Middle Third</div>
                      <p>{selectedPipeEntry.middleThirdNotes}</p>
                    </div>
                  ) : null}
                  {selectedPipeEntry.finalThirdNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Final Third</div>
                      <p>{selectedPipeEntry.finalThirdNotes}</p>
                    </div>
                  ) : null}
                  {selectedPipeEntry.tinNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Tin Notes</div>
                      <p>{selectedPipeEntry.tinNotes}</p>
                    </div>
                  ) : null}
                  {selectedPipeEntry.prepNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Prep Notes</div>
                      <p>{selectedPipeEntry.prepNotes}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </section>
        ) : view === "detail" && selectedCigarEntry && selectedCategory === "cigar" ? (
          <section className="detail-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("home")}
                aria-label="Back to journal"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Cigar Session</h2>
              <div className="header-action-group">
                <button
                  className={selectedCigarEntry.isFavorite ? "header-icon-btn active" : "header-icon-btn"}
                  type="button"
                  aria-label={favoriteLabel(selectedCigarEntry.isFavorite)}
                  onClick={() => toggleCigarFavorite(selectedCigarEntry.id)}
                >
                  <span className={selectedCigarEntry.isFavorite ? "detail-favorite-heart active" : "detail-favorite-heart"} aria-hidden="true">
                    ♥
                  </span>
                </button>
                <button className="header-action-btn" type="button" onClick={() => startEditingCigarEntry(selectedCigarEntry)}>
                  Edit
                </button>
              </div>
            </header>

            {!selectedCigarEntryIsFull ? (
              <section className="detail-upgrade-strip">
                <span>Want more detail here?</span>
                <button className="inline-upgrade-btn" type="button" onClick={() => startEditingCigarEntry(selectedCigarEntry, true)}>
                  Make It A Full Entry
                </button>
              </section>
            ) : null}

            <section className="detail-hero">
              <div className="detail-kicker">{selectedCigarEntry.brand || "Cigar Journal"}</div>
              <h1 className="detail-title">{selectedCigarEntry.lineName}</h1>
              <div className="detail-score">
                {selectedCigarEntry.suggestedScore.toFixed(1)}
                <span> /10</span>
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/cigar.png" alt="" />
                The Session
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatJournalDate(selectedCigarEntry.date) || "Not logged"}</span>
                </div>
                {selectedCigarEntry.purchaseDate ? (
                  <div className="detail-item">
                    <span className="detail-label">Purchased</span>
                    <span className="detail-value">{formatJournalDate(selectedCigarEntry.purchaseDate)}</span>
                  </div>
                ) : null}
                <div className="detail-item">
                  <span className="detail-label">Time of Day</span>
                  <span className="detail-value">{selectedCigarEntry.timeOfDay || "Not logged"}</span>
                </div>
                {selectedCigarEntry.setting ? (
                  <div className="detail-item">
                    <span className="detail-label">Setting</span>
                    <span className="detail-value">{selectedCigarEntry.setting}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.location ? (
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{selectedCigarEntry.location}</span>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/cigar.png" alt="" />
                The Cigar
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Brand</span>
                  <span className="detail-value">{selectedCigarEntry.brand || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vitola</span>
                  <span className="detail-value">{selectedCigarEntry.vitola || "Not logged"}</span>
                </div>
                {selectedCigarEntry.cutType ? (
                  <div className="detail-item">
                    <span className="detail-label">Cut Type</span>
                    <span className="detail-value">{selectedCigarEntry.cutType}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.countryFactory ? (
                  <div className="detail-item">
                    <span className="detail-label">Country / Factory</span>
                    <span className="detail-value">{selectedCigarEntry.countryFactory}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.wrapper ? (
                  <div className="detail-item">
                    <span className="detail-label">Wrapper</span>
                    <span className="detail-value">{selectedCigarEntry.wrapper}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.binder ? (
                  <div className="detail-item">
                    <span className="detail-label">Binder</span>
                    <span className="detail-value">{selectedCigarEntry.binder}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.filler ? (
                  <div className="detail-item">
                    <span className="detail-label">Filler</span>
                    <span className="detail-value">{selectedCigarEntry.filler}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.boughtFrom ? (
                  <div className="detail-item">
                    <span className="detail-label">Bought From</span>
                    <span className="detail-value">{selectedCigarEntry.boughtFrom}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.price ? (
                  <div className="detail-item">
                    <span className="detail-label">Price</span>
                    <span className="detail-value">{selectedCigarEntry.price}</span>
                  </div>
                ) : null}
                {selectedCigarEntry.restTime ? (
                  <div className="detail-item">
                    <span className="detail-label">Rest Time</span>
                    <span className="detail-value">{selectedCigarEntry.restTime}</span>
                  </div>
                ) : null}
                <div className="detail-item">
                  <span className="detail-label">Strength</span>
                  <span className="detail-value">{selectedCigarEntry.strengthBand || "Medium"}</span>
                </div>
              </div>
              {selectedCigarEntry.flavorNotes.length ? (
                <div className="detail-tags">
                  {selectedCigarEntry.flavorNotes.map((note) => (
                    <span key={note} className="detail-tag">
                      {note}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/cigar.png" alt="" />
                Ratings
              </div>
              <div className="detail-ratings">
                {([
                  ["Flavor", selectedCigarEntry.ratings.flavor],
                  ["Construction", selectedCigarEntry.ratings.construction],
                  ["Draw", selectedCigarEntry.ratings.draw],
                  ["Burn", selectedCigarEntry.ratings.burn],
                  ["Aroma", selectedCigarEntry.ratings.aroma],
                  ["Strength", selectedCigarEntry.ratings.strength],
                  ["Enjoyment", selectedCigarEntry.ratings.enjoyment]
                ] as Array<[string, number]>)
                  .filter(([, value]) => value > 0)
                  .map(([label, value]) => (
                    <div key={label} className="detail-rating-row">
                      <span className="detail-label">{label}</span>
                      <span className="detail-value">{value}/10</span>
                    </div>
                  ))}
              </div>
            </section>

            {(selectedCigarEntry.quickNotes ||
              selectedCigarEntry.firstThirdNotes ||
              selectedCigarEntry.middleThirdNotes ||
              selectedCigarEntry.finalThirdNotes ||
              selectedCigarEntry.pairing ||
              selectedCigarEntry.buyAgain) ? (
              <section className="form-section detail-section">
                <div className="section-title">
                  <img className="section-title-icon" src="/cigar.png" alt="" />
                  Notes
                </div>
                <div className="detail-notes">
                  {selectedCigarEntry.quickNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Quick Notes</div>
                      <p>{selectedCigarEntry.quickNotes}</p>
                    </div>
                  ) : null}
                  {selectedCigarEntry.firstThirdNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">First Third</div>
                      <p>{selectedCigarEntry.firstThirdNotes}</p>
                    </div>
                  ) : null}
                  {selectedCigarEntry.middleThirdNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Middle Third</div>
                      <p>{selectedCigarEntry.middleThirdNotes}</p>
                    </div>
                  ) : null}
                  {selectedCigarEntry.finalThirdNotes ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Final Third</div>
                      <p>{selectedCigarEntry.finalThirdNotes}</p>
                    </div>
                  ) : null}
                  {selectedCigarEntry.pairing ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Pairing</div>
                      <p>{selectedCigarEntry.pairing}</p>
                    </div>
                  ) : null}
                  {selectedCigarEntry.buyAgain ? (
                    <div className="detail-note-block">
                      <div className="detail-label">Buy Again?</div>
                      <p>{selectedCigarEntry.buyAgain}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </section>
        ) : view === "detail" && selectedSpiritEntry && selectedCategory === "spirits" ? (
          <section className="detail-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={() => setView("home")}
                aria-label="Back to journal"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>Spirits Session</h2>
              <div className="header-action-group">
                <button
                  className={selectedSpiritEntry.isFavorite ? "header-icon-btn active" : "header-icon-btn"}
                  type="button"
                  aria-label={favoriteLabel(selectedSpiritEntry.isFavorite)}
                  onClick={() => toggleSpiritFavorite(selectedSpiritEntry.id)}
                >
                  <span className={selectedSpiritEntry.isFavorite ? "detail-favorite-heart active" : "detail-favorite-heart"} aria-hidden="true">
                    ♥
                  </span>
                </button>
                <button className="header-action-btn" type="button" onClick={() => startEditingSpiritEntry(selectedSpiritEntry)}>
                  Edit
                </button>
              </div>
            </header>

            {!selectedSpiritEntryIsFull ? (
              <section className="detail-upgrade-strip">
                <span>Want more detail here?</span>
                <button className="inline-upgrade-btn" type="button" onClick={() => startEditingSpiritEntry(selectedSpiritEntry, true)}>
                  Make It A Full Entry
                </button>
              </section>
            ) : null}

            <section className="detail-hero">
              <div className="detail-kicker">{selectedSpiritEntry.brand || "Spirits Journal"}</div>
              <h1 className="detail-title">{selectedSpiritEntry.name}</h1>
              <div className="detail-score">
                {selectedSpiritEntry.rating.toFixed(1)}
                <span> /10</span>
              </div>
              <div className="detail-hero-meta">
                <span className="detail-hero-pill">{selectedSpiritEntry.spiritType || "Spirit"}</span>
                {selectedSpiritEntry.proof ? (
                  <span className="detail-hero-pill">{formatSpiritProof(selectedSpiritEntry.proof)}</span>
                ) : null}
                <span className="detail-hero-pill">{selectedSpiritEntry.drinkStyle || "Not logged"}</span>
              </div>
            </section>

            <section className="form-section detail-section">
              <div className="section-title">
                <img className="section-title-icon" src="/whiskey.png" alt="" />
                Quick Review
              </div>
              <div className="detail-score-card">
                <div>
                  <div className="detail-score-card-label">Your Score</div>
                  <div className="detail-score-card-value">{selectedSpiritEntry.rating.toFixed(1)} / 10</div>
                </div>
                <div className="detail-score-card-note">{getSpiritRatingLabel(selectedSpiritEntry.rating)}</div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatJournalDate(selectedSpiritEntry.date) || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Spirit Type</span>
                  <span className="detail-value">{selectedSpiritEntry.spiritType || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Proof / ABV</span>
                  <span className="detail-value">{formatSpiritProof(selectedSpiritEntry.proof) || "Not logged"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Drink Style</span>
                  <span className="detail-value">{selectedSpiritEntry.drinkStyle || "Not logged"}</span>
                </div>
                {selectedSpiritEntry.pricePaid ? (
                  <div className="detail-item">
                    <span className="detail-label">Price Paid</span>
                    <span className="detail-value">{selectedSpiritEntry.pricePaid}</span>
                  </div>
                ) : null}
                {selectedSpiritEntry.buyAgain ? (
                  <div className="detail-item">
                    <span className="detail-label">Buy Again?</span>
                    <span className="detail-value">{selectedSpiritEntry.buyAgain}</span>
                  </div>
                ) : null}
              </div>
              {selectedSpiritEntry.quickTags.length ? (
                <div className="detail-tags">
                  {selectedSpiritEntry.quickTags.map((tag) => (
                    <span key={tag} className="detail-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            {selectedSpiritEntry.color ||
            selectedSpiritEntry.clarity ||
            selectedSpiritEntry.legs ||
            selectedSpiritEntry.beading ||
            selectedSpiritEntry.glass ? (
              <section className="form-section detail-section">
                <div className="section-title">
                  <img className="section-title-icon" src="/whiskey.png" alt="" />
                  Appearance
                </div>
                <div className="detail-grid">
                  {selectedSpiritEntry.color ? (
                    <div className="detail-item">
                      <span className="detail-label">Color</span>
                      <span className="detail-value">{selectedSpiritEntry.color}</span>
                    </div>
                  ) : null}
                  {selectedSpiritEntry.clarity ? (
                    <div className="detail-item">
                      <span className="detail-label">Clarity</span>
                      <span className="detail-value">{selectedSpiritEntry.clarity}</span>
                    </div>
                  ) : null}
                  {selectedSpiritEntry.legs ? (
                    <div className="detail-item">
                      <span className="detail-label">Legs</span>
                      <span className="detail-value">{selectedSpiritEntry.legs}</span>
                    </div>
                  ) : null}
                  {selectedSpiritEntry.beading ? (
                    <div className="detail-item">
                      <span className="detail-label">Beading</span>
                      <span className="detail-value">{selectedSpiritEntry.beading}</span>
                    </div>
                  ) : null}
                  {selectedSpiritEntry.glass ? (
                    <div className="detail-item">
                      <span className="detail-label">Glass</span>
                      <span className="detail-value">{selectedSpiritEntry.glass}</span>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {selectedSpiritEntry.aromaComplexity ||
            selectedSpiritEntry.aromaNotes ||
            selectedSpiritEntry.palateSweetness ||
            selectedSpiritEntry.palateTexture ||
            selectedSpiritEntry.palateBody ||
            selectedSpiritEntry.palateNotes ||
            selectedSpiritEntry.finishLength ||
            selectedSpiritEntry.finishNotes ? (
              <>
                {selectedSpiritEntry.aromaComplexity || selectedSpiritEntry.aromaNotes ? (
                  <section className="form-section detail-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/whiskey.png" alt="" />
                      Aroma
                    </div>
                    <div className="detail-grid">
                      {selectedSpiritEntry.aromaComplexity ? (
                        <div className="detail-item">
                          <span className="detail-label">Complexity</span>
                          <span className="detail-value">{selectedSpiritEntry.aromaComplexity}</span>
                        </div>
                      ) : null}
                    </div>
                    {selectedSpiritEntry.aromaNotes ? (
                      <div className="detail-notes">
                        <div className="detail-note-block">
                          <div className="detail-label">Aroma Notes</div>
                          <p>{selectedSpiritEntry.aromaNotes}</p>
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {selectedSpiritEntry.palateSweetness ||
                selectedSpiritEntry.palateTexture ||
                selectedSpiritEntry.palateBody ||
                selectedSpiritEntry.palateNotes ? (
                  <section className="form-section detail-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/whiskey.png" alt="" />
                      Palate
                    </div>
                    <div className="detail-grid">
                      {selectedSpiritEntry.palateSweetness ? (
                        <div className="detail-item">
                          <span className="detail-label">Sweetness</span>
                          <span className="detail-value">{selectedSpiritEntry.palateSweetness}</span>
                        </div>
                      ) : null}
                      {selectedSpiritEntry.palateTexture ? (
                        <div className="detail-item">
                          <span className="detail-label">Texture</span>
                          <span className="detail-value">{selectedSpiritEntry.palateTexture}</span>
                        </div>
                      ) : null}
                      {selectedSpiritEntry.palateBody ? (
                        <div className="detail-item">
                          <span className="detail-label">Body</span>
                          <span className="detail-value">{selectedSpiritEntry.palateBody}</span>
                        </div>
                      ) : null}
                    </div>
                    {selectedSpiritEntry.palateNotes ? (
                      <div className="detail-notes">
                        <div className="detail-note-block">
                          <div className="detail-label">Palate Notes</div>
                          <p>{selectedSpiritEntry.palateNotes}</p>
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {selectedSpiritEntry.flavorNotes.length ? (
                  <section className="form-section detail-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/whiskey.png" alt="" />
                      Flavor Notes
                    </div>
                    <div className="detail-tags">
                      {selectedSpiritEntry.flavorNotes.map((note) => (
                        <span key={note} className="detail-tag">
                          {note}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {selectedSpiritEntry.finishLength || selectedSpiritEntry.finishNotes ? (
                  <section className="form-section detail-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/whiskey.png" alt="" />
                      Finish
                    </div>
                    <div className="detail-grid">
                      {selectedSpiritEntry.finishLength ? (
                        <div className="detail-item">
                          <span className="detail-label">Length</span>
                          <span className="detail-value">{selectedSpiritEntry.finishLength}</span>
                        </div>
                      ) : null}
                    </div>
                    {selectedSpiritEntry.finishNotes ? (
                      <div className="detail-notes">
                        <div className="detail-note-block">
                          <div className="detail-label">Finish Notes</div>
                          <p>{selectedSpiritEntry.finishNotes}</p>
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </>
            ) : null}

            {selectedSpiritEntry.overallImpression ? (
              <section className="form-section detail-section">
                <div className="section-title">
                  <img className="section-title-icon" src="/whiskey.png" alt="" />
                  Impression
                </div>
                <div className="detail-notes">
                  <div className="detail-note-block">
                    <div className="detail-label">Overall Impression</div>
                    <p>{selectedSpiritEntry.overallImpression}</p>
                  </div>
                </div>
              </section>
            ) : null}
          </section>
        ) : (
          <section className="form-view">
            <header className="app-header">
              <button
                className="back-img-btn"
                type="button"
                onClick={handleFormBack}
                aria-label="Back to session picker"
              >
                <img src="/backbtn.png" alt="" />
              </button>
              <h2>
                {selectedCategory === "pipe" && isEditingPipeEntry
                  ? "Edit Pipe Session"
                  : selectedCategory === "cigar" && isEditingCigarEntry
                    ? "Edit Cigar Session"
                    : selectedCategory === "spirits" && isEditingSpiritEntry
                      ? "Edit Spirits Session"
                    : activePickerItem.title}
              </h2>
              <div className="header-spacer" />
            </header>

            <section className="form-section mode-panel">
              <div className="mode-toggle">
                <button
                  className={entryMode === "quick" ? "mode-btn active" : "mode-btn"}
                  type="button"
                  onClick={() => setEntryMode("quick")}
                >
                  Quick Entry
                </button>
                <button
                  className={entryMode === "full" ? "mode-btn active" : "mode-btn"}
                  type="button"
                  onClick={() => setEntryMode("full")}
                >
                  Full Entry
                </button>
              </div>
            </section>

            {selectedCategory === "pipe" ? (
              <>
                <section className="form-section">
                  <div className="field">
                    <label>Date</label>
                    <input
                      type="date"
                      value={pipeForm.date}
                      onChange={(event) => updatePipeField("date", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Time of Day</label>
                    <div className="pill-options">
                      {["Morning", "Afternoon", "Evening", "Late Night"].map((option) => (
                        <button
                          key={option}
                          className={pipeTimeOfDay === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => setPipeTimeOfDay((current) => toggleSingleChoice(current, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/cigar.png" alt="" />
                      Acquisition
                    </div>

                    <div className="field">
                      <label>Date of Purchase</label>
                      <input
                        type="date"
                        value={cigarForm.purchaseDate}
                        onChange={(event) => updateCigarField("purchaseDate", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Bought From</label>
                      <input
                        type="text"
                        placeholder="e.g. local B&M, trade, online shop..."
                        value={cigarForm.boughtFrom}
                        onChange={(event) => updateCigarField("boughtFrom", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Price</label>
                      <input
                        type="text"
                        placeholder="e.g. $14 or box split"
                        value={cigarForm.price}
                        onChange={(event) => updateCigarField("price", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Rest Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 weeks humidor rest"
                        value={cigarForm.restTime}
                        onChange={(event) => updateCigarField("restTime", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        Setting
                    </div>

                    <div className="field">
                      <label>Setting</label>
                      <input
                        type="text"
                        placeholder="e.g. Back porch, study, cigar lounge..."
                        value={pipeForm.setting}
                        onChange={(event) => updatePipeField("setting", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="City, venue..."
                        value={pipeForm.location}
                        onChange={(event) => updatePipeField("location", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    The Blend
                  </div>

                  <CatalogAutocompleteField
                    label="Brand"
                    value={pipeForm.brand}
                    placeholder="e.g. Peterson, Dunhill, Cornell & Diehl"
                    suggestions={pipeBrandSuggestions}
                    emptyActionLabel={pipeForm.brand.trim() ? `Add "${pipeForm.brand.trim()}" to your brands` : undefined}
                    onChange={(value) => updatePipeField("brand", value)}
                    onSelect={selectPipeBrandSuggestion}
                    onCreateCustom={addCustomBrandToUserCatalog}
                  />

                  <CatalogAutocompleteField
                    label="Blend Name"
                    required
                    value={pipeForm.blendName}
                    placeholder="e.g. Nightcap, Penzance, 1-Q"
                    suggestions={pipeBlendSuggestions}
                    emptyActionLabel={pipeForm.blendName.trim() ? `Add "${pipeForm.blendName.trim()}" to your blends` : undefined}
                    onChange={(value) => updatePipeField("blendName", value)}
                    onSelect={selectPipeBlendSuggestion}
                    onCreateCustom={addCustomBlendToUserCatalog}
                  />

                  {entryMode === "full" ? (
                    <>
                      <div className="field">
                        <label>Style / Family</label>
                        <div className="pill-options">
                          {["Virginia", "VaPer", "English", "Balkan", "Burley", "Aromatic"].map((option) => (
                            <button
                              key={option}
                              className={pipeBlendType === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => setPipeBlendType((current) => toggleSingleChoice(current, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Cut</label>
                        <div className="pill-options">
                          {["Ribbon", "Flake", "Broken Flake", "Coin", "Plug", "Ready Rubbed"].map((option) => (
                            <button
                              key={option}
                              className={pipeCutType === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => setPipeCutType((current) => toggleSingleChoice(current, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        Leaf & Components
                    </div>

                    <div className="field">
                      <label>Tobacco Components</label>
                      <div className="pill-options">
                        {["Virginia", "Perique", "Latakia", "Orientals", "Burley", "Cavendish"].map((option) => (
                          <button
                            key={option}
                            className={pipeComponents.includes(option) ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => togglePipeComponent(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Nicotine Strength</label>
                      <div className="pill-options">
                        {["Very Mild", "Mild", "Mild-Medium", "Medium", "Medium-Full", "Full"].map((option) => (
                          <button
                            key={option}
                            className={pipeNicotineStrength === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => setPipeNicotineStrength((current) => toggleSingleChoice(current, option))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null}

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        The Tin
                    </div>

                    <div className="field">
                      <label>Tin Notes — Aroma Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Vanilla, earthy, sweet..."
                        value={pipeForm.tinNotes}
                        onChange={(event) => updatePipeField("tinNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Tin Aroma Rating</label>
                      <div className="flame-rating" onMouseLeave={() => setPipeRatingHover((current) => ({ ...current, tin: 0 }))}>
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <button
                            key={value}
                            className={value <= (pipeRatingHover.tin || pipeRatings.tin) ? "flame-btn lit" : "flame-btn"}
                            type="button"
                            onMouseEnter={() => setPipeRatingHover((current) => ({ ...current, tin: value }))}
                            onClick={() => setPipeRating("tin", value)}
                            aria-label={`Tin aroma rating ${value}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Year Blended</label>
                      <input
                        type="text"
                        placeholder="e.g. 2022"
                        value={pipeForm.yearBlended}
                        onChange={(event) => updatePipeField("yearBlended", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Prep Notes</label>
                      <textarea
                        placeholder="e.g. Dried 20 min, rubbed out..."
                        value={pipeForm.prepNotes}
                        onChange={(event) => updatePipeField("prepNotes", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Pipe Used
                  </div>

                  <CatalogAutocompleteField
                    label="Pipe Used"
                    value={pipeForm.pipeUsed}
                    placeholder="e.g. Peterson 999"
                    suggestions={pipeUsedSuggestions}
                    emptyActionLabel={pipeForm.pipeUsed.trim() ? `Add "${pipeForm.pipeUsed.trim()}" to your pipes` : undefined}
                    onChange={(value) => updatePipeField("pipeUsed", value)}
                    onSelect={selectPipeUsedSuggestion}
                    onCreateCustom={addCustomPipeToUserCatalog}
                  />

                  {entryMode === "full" ? (
                    <div className="field">
                      <label>Lighter Used</label>
                      <input
                        type="text"
                        placeholder="e.g. Xikar, Zippo, matches"
                        value={pipeForm.lighterUsed}
                        onChange={(event) => updatePipeField("lighterUsed", event.target.value)}
                      />
                    </div>
                  ) : null}
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                        <img className="section-title-icon" src={activePickerItem.image} alt="" />
                        Tasting Notes
                    </div>

                    <div className="field">
                      <label>First Third <span className="label-hint">— the light &amp; opening</span></label>
                      <textarea
                        placeholder="First flavors, aroma on the light, initial character..."
                        value={pipeForm.firstThirdNotes}
                        onChange={(event) => updatePipeField("firstThirdNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Middle Third <span className="label-hint">— development</span></label>
                      <textarea
                        placeholder="How does it change and develop..."
                        value={pipeForm.middleThirdNotes}
                        onChange={(event) => updatePipeField("middleThirdNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Final Third <span className="label-hint">— finish</span></label>
                      <textarea
                        placeholder="How does it finish? Any surprises at the end..."
                        value={pipeForm.finalThirdNotes}
                        onChange={(event) => updatePipeField("finalThirdNotes", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                      <img className="section-title-icon" src={activePickerItem.image} alt="" />
                      Burn & Mechanics
                    </div>

                    <div className="pill-options">
                      {["Needed Relights", "Tongue Bite", "Gurgling", "Went Out", "Dottle"].map((option) => (
                        <button key={option} className="pill-opt" type="button">
                          {option}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Rate It
                  </div>

                  {[
                    ["Flavor", "Taste, richness, and depth", "flavor"],
                    ["Strength", "Nicotine and body level", "strength"],
                    ["Room Note", "Aroma in the room", "roomNote"],
                    ["Performance", "Burn, comfort, and ease", "performance"],
                    ["Overall Enjoyment", "Total smoking satisfaction", "enjoyment"]
                  ].map(([label, hint, key]) => (
                    <div key={key} className="field">
                      <label>
                        {label} <span className="label-hint">— {hint}</span>
                      </label>
                      <div
                        className="flame-rating"
                        onMouseLeave={() => setPipeRatingHover((current) => ({ ...current, [key]: 0 }))}
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <button
                            key={value}
                            className={
                              value <= ((pipeRatingHover[key as keyof PipeRatings] || pipeRatings[key as keyof PipeRatings]))
                                ? "flame-btn lit"
                                : "flame-btn"
                            }
                            type="button"
                            onMouseEnter={() => setPipeRatingHover((current) => ({ ...current, [key]: value }))}
                            onClick={() => setPipeRating(key as keyof PipeRatings, value)}
                            aria-label={`${label} rating ${value}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {entryMode === "full" ? (
                    <div className="field">
                      <label>Mechanics Score <span className="label-hint">— Burn, draw, and comfort</span></label>
                      <div
                        className="flame-rating"
                        onMouseLeave={() => setPipeRatingHover((current) => ({ ...current, mechanics: 0 }))}
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <button
                            key={value}
                            className={value <= (pipeRatingHover.mechanics || pipeRatings.mechanics) ? "flame-btn lit" : "flame-btn"}
                            type="button"
                            onMouseEnter={() => setPipeRatingHover((current) => ({ ...current, mechanics: value }))}
                            onClick={() => setPipeRating("mechanics", value)}
                            aria-label={`Mechanics rating ${value}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Notes
                  </div>

                  <div className="field">
                    <label>{entryMode === "quick" ? "Anything worth remembering?" : "Quick Notes"}</label>
                    <textarea
                      placeholder="Flavors, impressions, context — anything..."
                      value={pipeForm.quickNotes}
                      onChange={(event) => updatePipeField("quickNotes", event.target.value)}
                    />
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src={activePickerItem.image} alt="" />
                    Overall Rating
                  </div>

                  <div className="suggested-score-box">
                    <div className="suggested-score-label">Suggested Score</div>
                    <div className="suggested-score-val">{pipeSuggestedScore.toFixed(1)} / 10</div>
                    <div className="suggested-score-note">Based on your current tasting ratings</div>
                  </div>
                </section>
              </>
            ) : selectedCategory === "cigar" ? (
              <>
                <section className="form-section">
                  <div className="field">
                    <label>Date</label>
                    <input
                      type="date"
                      value={cigarForm.date}
                      onChange={(event) => updateCigarField("date", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Time of Day</label>
                    <div className="pill-options">
                      {["Morning", "Afternoon", "Evening", "Late Night"].map((option) => (
                        <button
                          key={option}
                          className={cigarTimeOfDay === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => setCigarTimeOfDay((current) => toggleSingleChoice(current, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/cigar.png" alt="" />
                      Setting
                    </div>

                    <div className="field">
                      <label>Setting</label>
                      <input
                        type="text"
                        placeholder="e.g. Patio, lounge, celebration dinner..."
                        value={cigarForm.setting}
                        onChange={(event) => updateCigarField("setting", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Location</label>
                      <input
                        type="text"
                        placeholder="City, venue..."
                        value={cigarForm.location}
                        onChange={(event) => updateCigarField("location", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/cigar.png" alt="" />
                    The Cigar
                  </div>

                  <CatalogAutocompleteField
                    label="Brand"
                    value={cigarForm.brand}
                    placeholder="e.g. Padron, Arturo Fuente, Davidoff"
                    suggestions={cigarBrandSuggestions}
                    emptyActionLabel={cigarForm.brand.trim() ? `Add "${cigarForm.brand.trim()}" to your cigar brands` : undefined}
                    onChange={(value) => updateCigarField("brand", value)}
                    onSelect={selectCigarBrandSuggestion}
                    onCreateCustom={addCustomCigarBrandToUserCatalog}
                  />

                  <CatalogAutocompleteField
                    label="Line Name"
                    required
                    value={cigarForm.lineName}
                    placeholder="e.g. 1964 Anniversary, Hemingway, Serie D No. 4"
                    suggestions={cigarLineSuggestions}
                    emptyActionLabel={cigarForm.lineName.trim() ? `Add "${cigarForm.lineName.trim()}" to your cigars` : undefined}
                    onChange={(value) => updateCigarField("lineName", value)}
                    onSelect={selectCigarLineSuggestion}
                    onCreateCustom={addCustomCigarLineToUserCatalog}
                  />

                  <div className="field">
                    <label>Vitola</label>
                    <input
                      type="text"
                      placeholder="e.g. Robusto, Toro, Churchill"
                      value={cigarForm.vitola}
                      onChange={(event) => updateCigarField("vitola", event.target.value)}
                    />
                  </div>

                  {entryMode === "full" ? (
                    <>
                      <div className="field">
                        <label>Country / Factory</label>
                        <input
                          type="text"
                          placeholder="e.g. Nicaragua, Dominican Republic..."
                          value={cigarForm.countryFactory}
                          onChange={(event) => updateCigarField("countryFactory", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Wrapper Shade</label>
                        <div className="pill-options">
                          {["Claro", "Natural", "Colorado", "Maduro", "Oscuro"].map((option) => (
                            <button
                              key={option}
                              className={cigarWrapperShade === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => setCigarWrapperShade((current) => toggleSingleChoice(current, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Wrapper</label>
                        <input
                          type="text"
                          placeholder="e.g. Ecuador Habano, Connecticut Broadleaf"
                          value={cigarForm.wrapper}
                          onChange={(event) => updateCigarField("wrapper", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Binder</label>
                        <input
                          type="text"
                          placeholder="e.g. Nicaraguan, Dominican"
                          value={cigarForm.binder}
                          onChange={(event) => updateCigarField("binder", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Filler</label>
                        <input
                          type="text"
                          placeholder="e.g. Nicaraguan long-fillers"
                          value={cigarForm.filler}
                          onChange={(event) => updateCigarField("filler", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Cut Type</label>
                        <div className="pill-options">
                          {["Straight Cut", "V Cut", "Punch", "Tear"].map((option) => (
                            <button
                              key={option}
                              className={cigarForm.cutType === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                            onClick={() => updateCigarField("cutType", toggleSingleChoice(cigarForm.cutType, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/cigar.png" alt="" />
                      Flavor Notes
                    </div>

                    <div className="field">
                      <label>First Third</label>
                      <textarea
                        placeholder="Opening flavors, aroma, and how it starts..."
                        value={cigarForm.firstThirdNotes}
                        onChange={(event) => updateCigarField("firstThirdNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Middle Third</label>
                      <textarea
                        placeholder="How it develops through the middle..."
                        value={cigarForm.middleThirdNotes}
                        onChange={(event) => updateCigarField("middleThirdNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Final Third</label>
                      <textarea
                        placeholder="How it finishes and changes at the end..."
                        value={cigarForm.finalThirdNotes}
                        onChange={(event) => updateCigarField("finalThirdNotes", event.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Tap the flavors that showed up</label>
                      <div className="pill-options">
                        {cigarFlavorOptions.map((note) => (
                          <button
                            key={note}
                            className={cigarForm.flavorNotes.includes(note) ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => toggleCigarFlavorNote(note)}
                          >
                            {note}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Add your own flavor</label>
                      <div className="custom-flavor-row">
                        <input
                          type="text"
                          placeholder="e.g. graham cracker, black tea..."
                          value={customCigarFlavor}
                          onChange={(event) => setCustomCigarFlavor(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addCustomCigarFlavorNote();
                            }
                          }}
                        />
                        <button className="chip-add-btn" type="button" onClick={addCustomCigarFlavorNote}>
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <label>Strength</label>
                      <div className="slider-field">
                        <input
                          className="strength-slider"
                          type="range"
                          min="0"
                          max={String(cigarStrengthOptions.length - 1)}
                          step="1"
                          value={cigarStrengthIndex(cigarForm.strengthBand)}
                          onChange={(event) =>
                            updateCigarField("strengthBand", cigarStrengthOptions[Number(event.target.value)] ?? "Medium")
                          }
                        />
                        <div className="slider-label-row" aria-hidden="true">
                          {cigarStrengthOptions.map((option) => (
                            <span
                              key={option}
                              className={cigarForm.strengthBand === option ? "slider-label active" : "slider-label"}
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/cigar.png" alt="" />
                    Rate It
                  </div>

                  {[
                    ["Flavor", "Depth, balance, and richness", "flavor"],
                    ["Construction", "Build and feel in hand", "construction"],
                    ["Draw", "Airflow and resistance", "draw"],
                    ["Burn", "Evenness and combustion", "burn"],
                    ["Aroma", "Room and wrapper aroma", "aroma"],
                    ["Strength", "Body and nicotine", "strength"],
                    ["Enjoyment", "Overall satisfaction", "enjoyment"]
                  ].map(([label, hint, key]) => (
                    <div key={key} className="field">
                      <label>
                        {label} <span className="label-hint">— {hint}</span>
                      </label>
                      <div
                        className="flame-rating"
                        onMouseLeave={() => setCigarRatingHover((current) => ({ ...current, [key]: 0 }))}
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <button
                            key={value}
                            className={
                              value <= (cigarRatingHover[key as keyof CigarRatings] || cigarRatings[key as keyof CigarRatings])
                                ? "flame-btn lit"
                                : "flame-btn"
                            }
                            type="button"
                            onMouseEnter={() => setCigarRatingHover((current) => ({ ...current, [key]: value }))}
                            onClick={() => setCigarRating(key as keyof CigarRatings, value)}
                            aria-label={`${label} rating ${value}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/cigar.png" alt="" />
                      Pairing
                    </div>

                    <div className="field">
                      <label>Pairing</label>
                      <input
                        type="text"
                        placeholder="e.g. Espresso, bourbon, celebration pour..."
                        value={cigarForm.pairing}
                        onChange={(event) => updateCigarField("pairing", event.target.value)}
                      />
                    </div>
                  </section>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/cigar.png" alt="" />
                    Notes
                  </div>

                  <div className="field">
                    <label>{entryMode === "quick" ? "Anything worth remembering?" : "Quick Notes"}</label>
                    <textarea
                      placeholder="Flavor, mood, occasion, company..."
                      value={cigarForm.quickNotes}
                      onChange={(event) => updateCigarField("quickNotes", event.target.value)}
                    />
                  </div>

                  {entryMode === "full" ? (
                    <div className="field">
                      <label>Buy Again?</label>
                      <div className="pill-options">
                        {["No", "Single", "Pack", "Full Box"].map((option) => (
                          <button
                            key={option}
                            className={cigarForm.buyAgain === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => updateCigarField("buyAgain", toggleSingleChoice(cigarForm.buyAgain, option))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/cigar.png" alt="" />
                    Overall Rating
                  </div>

                  <div className="suggested-score-box">
                    <div className="suggested-score-label">Suggested Score</div>
                    <div className="suggested-score-val">{cigarSuggestedScore.toFixed(1)} / 10</div>
                    <div className="suggested-score-note">Based on your current tasting ratings</div>
                  </div>
                </section>
              </>
            ) : selectedCategory === "spirits" ? (
              <>
                <section className="form-section">
                  <div className="field">
                    <label>Date</label>
                    <input
                      type="date"
                      value={spiritForm.date}
                      onChange={(event) => updateSpiritField("date", event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Time of Day</label>
                    <div className="pill-options">
                      {["Morning", "Afternoon", "Evening", "Late Night"].map((option) => (
                        <button
                          key={option}
                          className={spiritForm.timeOfDay === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateSpiritField("timeOfDay", toggleSingleChoice(spiritForm.timeOfDay, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/whiskey.png" alt="" />
                    The Pour
                  </div>

                  <div className="field">
                    <label>Spirit Type</label>
                    <div className="pill-options">
                      {spiritTypeOptions.map((option) => (
                        <button
                          key={option}
                          className={spiritForm.spiritType === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateSpiritField("spiritType", toggleSingleChoice(spiritForm.spiritType, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <CatalogAutocompleteField
                    label="Spirit Name"
                    required
                    value={spiritForm.name}
                    placeholder="e.g. Eagle Rare 10, Rare Breed"
                    suggestions={spiritNameSuggestions}
                    emptyActionLabel={spiritForm.name.trim() ? `Add "${spiritForm.name.trim()}" to your spirits` : undefined}
                    onChange={(value) => updateSpiritField("name", value)}
                    onSelect={selectSpiritNameSuggestion}
                    onCreateCustom={addCustomSpiritToUserCatalog}
                  />

                  <CatalogAutocompleteField
                    label="Distillery / Brand"
                    value={spiritForm.brand}
                    placeholder="e.g. Buffalo Trace, Wild Turkey"
                    suggestions={spiritBrandSuggestions}
                    emptyActionLabel={spiritForm.brand.trim() ? `Add "${spiritForm.brand.trim()}" to your brands` : undefined}
                    onChange={(value) => updateSpiritField("brand", value)}
                    onSelect={selectSpiritBrandSuggestion}
                    onCreateCustom={addCustomSpiritBrandToUserCatalog}
                  />

                  {entryMode === "full" ? (
                    <>
                      <div className="field">
                        <label>Age Statement</label>
                        <input
                          type="text"
                          placeholder="e.g. 10 years, NAS"
                          value={spiritForm.ageStatement}
                          onChange={(event) => updateSpiritField("ageStatement", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Proof / ABV</label>
                        <input
                          type="text"
                          placeholder="e.g. 90 proof or 45% ABV"
                          value={spiritForm.proof}
                          onChange={(event) => updateSpiritField("proof", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Mashbill <span className="label-hint">— if known</span></label>
                        <input
                          type="text"
                          placeholder="e.g. 75% corn, 13% rye, 12% malted barley"
                          value={spiritForm.mashbill}
                          onChange={(event) => updateSpiritField("mashbill", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Barrel Type / Finish <span className="label-hint">— if known</span></label>
                        <input
                          type="text"
                          placeholder="e.g. New charred oak, port finish, sherry cask"
                          value={spiritForm.barrelTypeFinish}
                          onChange={(event) => updateSpiritField("barrelTypeFinish", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Batch / Barrel # <span className="label-hint">— if bourbon</span></label>
                        <input
                          type="text"
                          placeholder="e.g. A123, Barrel 214"
                          value={spiritForm.batchBarrelNumber}
                          onChange={(event) => updateSpiritField("batchBarrelNumber", event.target.value)}
                        />
                      </div>

                      <div className="field">
                        <label>Price</label>
                        <input
                          type="text"
                          placeholder="e.g. $58"
                          value={spiritForm.pricePaid}
                          onChange={(event) => updateSpiritField("pricePaid", event.target.value)}
                        />
                      </div>
                    </>
                  ) : null}

                  <div className="field">
                    <label>Drink Style</label>
                    <div className="pill-options">
                      {spiritDrinkStyleOptions.map((option) => (
                        <button
                          key={option}
                          className={spiritForm.drinkStyle === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateSpiritField("drinkStyle", toggleSingleChoice(spiritForm.drinkStyle, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {entryMode === "quick" ? (
                    <div className="field">
                      <label>Proof / ABV</label>
                      <input
                        type="text"
                        placeholder="e.g. 90 proof or 45% ABV"
                        value={spiritForm.proof}
                        onChange={(event) => updateSpiritField("proof", event.target.value)}
                      />
                    </div>
                  ) : null}
                </section>

                {entryMode === "full" ? (
                  <section className="form-section">
                    <div className="section-title">
                      <img className="section-title-icon" src="/whiskey.png" alt="" />
                      Appearance
                    </div>

                    <div className="field">
                      <label>Color</label>
                      <div className="pill-options">
                        {spiritColorOptions.map((option) => (
                          <button
                            key={option}
                            className={spiritForm.color === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => updateSpiritField("color", toggleSingleChoice(spiritForm.color, option))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Clarity</label>
                      <div className="pill-options">
                        {spiritClarityOptions.map((option) => (
                          <button
                            key={option}
                            className={spiritForm.clarity === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => updateSpiritField("clarity", toggleSingleChoice(spiritForm.clarity, option))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Legs</label>
                      <div className="pill-options">
                        {spiritLegsOptions.map((option) => (
                          <button
                            key={option}
                            className={spiritForm.legs === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => updateSpiritField("legs", toggleSingleChoice(spiritForm.legs, option))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Beading</label>
                      <div className="pill-options">
                        {spiritBeadingOptions.map((option) => (
                          <button
                            key={option}
                            className={spiritForm.beading === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => updateSpiritField("beading", toggleSingleChoice(spiritForm.beading, option))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Glass</label>
                      <div className="pill-options">
                        {spiritGlassOptions.map((option) => (
                          <button
                            key={option}
                            className={spiritForm.glass === option ? "pill-opt active" : "pill-opt"}
                            type="button"
                            onClick={() => updateSpiritField("glass", toggleSingleChoice(spiritForm.glass, option))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null}

                {entryMode === "full" ? (
                  <>
                    <section className="form-section">
                      <div className="section-title">
                        <img className="section-title-icon" src="/whiskey.png" alt="" />
                        Aroma
                      </div>

                      <div className="field">
                        <label>Complexity</label>
                        <div className="pill-options">
                          {spiritAromaComplexityOptions.map((option) => (
                            <button
                              key={option}
                              className={spiritForm.aromaComplexity === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => updateSpiritField("aromaComplexity", toggleSingleChoice(spiritForm.aromaComplexity, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Aroma Notes</label>
                        <textarea
                          placeholder="What do you get on the nose? Fruit, oak, spice, confectionary notes..."
                          value={spiritForm.aromaNotes}
                          onChange={(event) => updateSpiritField("aromaNotes", event.target.value)}
                        />
                      </div>
                    </section>

                    <section className="form-section">
                      <div className="section-title">
                        <img className="section-title-icon" src="/whiskey.png" alt="" />
                        Palate
                      </div>

                      <div className="field">
                        <label>Sweetness</label>
                        <div className="pill-options">
                          {spiritPalateSweetnessOptions.map((option) => (
                            <button
                              key={option}
                              className={spiritForm.palateSweetness === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => updateSpiritField("palateSweetness", toggleSingleChoice(spiritForm.palateSweetness, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Texture</label>
                        <div className="pill-options">
                          {spiritPalateTextureOptions.map((option) => (
                            <button
                              key={option}
                              className={spiritForm.palateTexture === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => updateSpiritField("palateTexture", toggleSingleChoice(spiritForm.palateTexture, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Body</label>
                        <div className="pill-options">
                          {spiritPalateBodyOptions.map((option) => (
                            <button
                              key={option}
                              className={spiritForm.palateBody === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => updateSpiritField("palateBody", toggleSingleChoice(spiritForm.palateBody, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Palate Notes</label>
                        <textarea
                          placeholder="What hits first, how does it evolve, and what stands out on the palate?"
                          value={spiritForm.palateNotes}
                          onChange={(event) => updateSpiritField("palateNotes", event.target.value)}
                        />
                      </div>
                    </section>

                    <section className="form-section">
                      <div className="section-title">
                        <img className="section-title-icon" src="/whiskey.png" alt="" />
                        Flavor Notes
                      </div>

                      <div className="field">
                        <label>Tap the flavors that showed up</label>
                        <div className="pill-options">
                          {spiritFlavorOptions.map((note) => (
                            <button
                              key={note}
                              className={spiritForm.flavorNotes.includes(note) ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => toggleSpiritFlavorNote(note)}
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Add your own flavor</label>
                        <div className="custom-flavor-row">
                          <input
                            type="text"
                            placeholder="e.g. brown sugar, black tea..."
                            value={customSpiritFlavor}
                            onChange={(event) => setCustomSpiritFlavor(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addCustomSpiritFlavorNote();
                              }
                            }}
                          />
                          <button className="chip-add-btn" type="button" onClick={addCustomSpiritFlavorNote}>
                            Add
                          </button>
                        </div>
                      </div>
                    </section>

                    <section className="form-section">
                      <div className="section-title">
                        <img className="section-title-icon" src="/whiskey.png" alt="" />
                        Finish
                      </div>

                      <div className="field">
                        <label>Length</label>
                        <div className="pill-options">
                          {spiritFinishLengthOptions.map((option) => (
                            <button
                              key={option}
                              className={spiritForm.finishLength === option ? "pill-opt active" : "pill-opt"}
                              type="button"
                              onClick={() => updateSpiritField("finishLength", toggleSingleChoice(spiritForm.finishLength, option))}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="field">
                        <label>Finish Notes</label>
                        <textarea
                          placeholder="How long does it linger, and what stays with you at the end?"
                          value={spiritForm.finishNotes}
                          onChange={(event) => updateSpiritField("finishNotes", event.target.value)}
                        />
                      </div>
                    </section>
                  </>
                ) : null}

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/whiskey.png" alt="" />
                    The Review
                  </div>

                  <div className="field">
                    <label>
                      Overall Rating <span className="label-hint">— tap the glass that feels right</span>
                    </label>
                    <div className="flame-rating spirit-rating" onMouseLeave={() => setSpiritRatingHover(0)}>
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                        <button
                          key={value}
                          className={value <= (spiritRatingHover || spiritRating) ? "flame-btn lit" : "flame-btn"}
                          type="button"
                          onMouseEnter={() => setSpiritRatingHover(value)}
                          onClick={() => setSpiritRating(spiritRating === value ? 0 : value)}
                          aria-label={`Spirit rating ${value}`}
                        >
                          🥃
                        </button>
                      ))}
                    </div>
                    <div className="field-support">
                      Use the quick score for your gut reaction, then leave yourself a line or two about why.
                    </div>
                  </div>

                  <div className="suggested-score-box spirit-score-box">
                    <div className="suggested-score-label">Current Score</div>
                    <div className="suggested-score-val">{spiritRating.toFixed(1)} / 10</div>
                    <div className="suggested-score-note">{getSpiritRatingLabel(spiritRating)}</div>
                  </div>

                  <div className="field">
                    <label>Would I Buy Again?</label>
                    <div className="pill-options">
                      {spiritBuyAgainOptions.map((option) => (
                        <button
                          key={option}
                          className={spiritForm.buyAgain === option ? "pill-opt active" : "pill-opt"}
                          type="button"
                          onClick={() => updateSpiritField("buyAgain", toggleSingleChoice(spiritForm.buyAgain, option))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-title">
                    <img className="section-title-icon" src="/whiskey.png" alt="" />
                    Notes
                  </div>

                  <div className="field">
                    <label>{entryMode === "quick" ? "One-line Impression" : "Overall Impression"}</label>
                    <textarea
                      placeholder={
                        entryMode === "quick"
                          ? 'e.g. "Easy sipper, buying again."'
                          : 'e.g. "Brown sugar up front, easy sipper, a little thin on the finish."'
                      }
                      value={spiritForm.overallImpression}
                      onChange={(event) => updateSpiritField("overallImpression", event.target.value)}
                    />
                  </div>
                </section>

              </>
            ) : (
              <section className="form-section">
                <div className="section-title">
                  <img className="section-title-icon" src={activePickerItem.image} alt="" />
                  {activePickerItem.label} Session
                </div>
                <div className="field">
                  <label>Name <span className="req">*</span></label>
                  <input type="text" placeholder="e.g. Eagle Rare 10" />
                </div>
              </section>
            )}

            <button
              className="save-btn"
              type="button"
              onClick={
                selectedCategory === "pipe"
                  ? savePipeEntry
                  : selectedCategory === "cigar"
                    ? saveCigarEntry
                    : selectedCategory === "spirits"
                      ? saveSpiritEntry
                      : undefined
              }
            >
              {(isEditingPipeEntry && selectedCategory === "pipe") ||
              (isEditingCigarEntry && selectedCategory === "cigar") ||
              (isEditingSpiritEntry && selectedCategory === "spirits")
                ? "Save Changes"
                : "Save Entry"}
            </button>
          </section>
        )}

        <nav className="bottom-nav" aria-label="Primary">
          <button
            className={view === "home" ? "bn-tab active" : "bn-tab"}
            type="button"
            onClick={() => {
              setEditingPipeEntryId(null);
              setEditingCigarEntryId(null);
              setView("home");
            }}
          >
            <svg width="26" height="26" viewBox="0 0 492.308 492.308" fill="currentColor" aria-hidden="true">
              <path d="M483.856,24.067c-77.804-11.16-159.893,1.963-237.703,37.817C168.344,26.041,86.255,12.931,8.452,24.067L0,25.274v408.111l11.24-1.611c75.365-10.774,155.077,2.351,230.385,37.88l0.722,0.355l3.297,2.02l0.416-0.196l0.555,0.273l3.522-2.194l0.344-0.162c75.519-35.625,155.231-48.76,230.587-37.976l11.24,1.611V25.274L483.856,24.067z M236.308,445.635c-56.75-24.63-115.567-37.216-173.183-37.216c-14.567,0-29.067,0.808-43.433,2.428V42.452c71.019-8.447,145.577,4.12,216.615,36.519V445.635z M329.49,53.024c23.187-5.99,46.463-9.914,69.644-11.742v118.752l-34.827-26.12l-34.817,26.115V53.024z M472.615,410.846c-71.096-8.043-145.413,3.913-216.615,34.798V78.971c17.749-8.094,35.719-14.949,53.798-20.548v141l54.51-40.894l54.519,40.889V40.042c18.079-0.496,36.046,0.301,53.788,2.41V410.846z" />
              <path d="M47.471,343l2.788,19.49c49.875-7.115,102.663,1.587,152.673,25.197l8.404-17.808C157.827,344.616,101.135,335.317,47.471,343z" />
              <path d="M47.471,264.063l2.788,19.49c49.875-7.13,102.663,1.587,152.673,25.197l8.404-17.808C157.817,265.668,101.135,256.385,47.471,264.063z" />
              <path d="M47.471,185.125l2.788,19.49c49.875-7.125,102.663,1.582,152.673,25.197l8.404-17.808C157.827,186.736,101.135,177.447,47.471,185.125z" />
              <path d="M47.471,106.188l2.788,19.49c49.885-7.13,102.654,1.572,152.673,25.192l8.404-17.808C157.817,107.798,101.135,98.5,47.471,106.188z" />
            </svg>
            The Log
          </button>

          <button
            className="bn-log"
            type="button"
            onClick={() => {
              setEditingPipeEntryId(null);
              setEditingCigarEntryId(null);
              setView("picker");
            }}
          >
            <div className="bn-log-circle">
              <span className="bn-log-plus">+</span>
            </div>
            <span className="bn-log-label">Session</span>
          </button>

          <button
            className={view === "collection" ? "bn-tab active" : "bn-tab"}
            type="button"
            onClick={() => setView("collection")}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Collection
          </button>
        </nav>
      </div>
    </main>
  );
}
