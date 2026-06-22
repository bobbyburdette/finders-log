import type {
  Category,
  CollectionFormKind,
  CollectionTab,
  SocialAuthProvider
} from "@/lib/home-shell/types";

export const socialAuthProviders: Array<{
  provider: SocialAuthProvider;
  label: string;
  mark: string;
}> = [{ provider: "google", label: "Continue with Google", mark: "G" }];

export const pickerItems: Array<{
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

export const cigarFlavorFamilies = [
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

export const cigarStrengthOptions = ["Mellow", "Mild", "Medium", "Med-Bold", "Bold"] as const;
export const spiritTypeOptions = [
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
export const spiritDrinkStyleOptions = ["Neat", "Rocks", "Splash", "Cocktail"] as const;
export const spiritBuyAgainOptions = ["Yes", "Maybe", "No"] as const;
export const spiritColorOptions = ["Clear", "Straw", "Gold", "Copper", "Tawny", "Mahogany", "Old Oak"] as const;
export const spiritClarityOptions = ["Clear", "Hazy", "Opaque"] as const;
export const spiritLegsOptions = ["Thick / Slow", "Semi-slow", "Thin / Fast"] as const;
export const spiritBeadingOptions = ["Clings to glass", "Lingers", "None"] as const;
export const spiritGlassOptions = ["Tumbler", "Glencairn", "Tulip", "Copita", "Neat Glass"] as const;
export const spiritAromaComplexityOptions = ["Low", "Medium", "High"] as const;
export const spiritPalateSweetnessOptions = ["Dry", "Medium", "Sweet"] as const;
export const spiritPalateTextureOptions = ["Harsh", "Medium", "Smooth"] as const;
export const spiritPalateBodyOptions = ["Light", "Medium", "Full-bodied"] as const;
export const spiritFinishLengthOptions = ["Short", "Medium", "Long"] as const;
export const spiritFlavorOptions = [
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

export const collectionTabs: Array<{
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
    heroImage: "/MyHumidor2.jpg",
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
    heroImage: "/MyCellar2.jpg",
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
    heroImage: "/MyBar2.jpg",
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

export const COLLECTION_CIGARS_KEY = "finders-log.collection.cigars";
export const COLLECTION_TOBACCOS_KEY = "finders-log.collection.tobaccos";
export const COLLECTION_PIPES_KEY = "finders-log.collection.pipes";
export const COLLECTION_BOTTLES_KEY = "finders-log.collection.bottles";
export const COLLECTION_WISHLIST_CIGARS_KEY = "finders-log.collection.wishlist.cigars";
export const COLLECTION_WISHLIST_PIPES_KEY = "finders-log.collection.wishlist.pipes";
export const COLLECTION_WISHLIST_BOTTLES_KEY = "finders-log.collection.wishlist.bottles";
export const collectionCigarVitolaOptions = ["Robusto", "Toro", "Churchill", "Corona", "Gordo", "Petit Corona", "Lancero"] as const;
export const collectionCigarWrapperShadeOptions = ["Claro", "Natural", "Colorado", "Maduro", "Oscuro"] as const;
export const collectionCigarStatusOptions = ["Resting", "Ready to Smoke", "Aging", "Gone"] as const;
export const collectionTobaccoStyleOptions = ["Virginia", "VaPer", "English", "Balkan", "Aromatic", "Burley", "Oriental", "Lakeland", "Other"] as const;
export const collectionTobaccoCutOptions = ["Ribbon", "Flake", "Broken Flake", "Coin", "Plug", "Ready Rubbed", "Shag", "Crumble Cake", "Other"] as const;
export const collectionTobaccoStorageOptions = ["Sealed Tin", "Mason Jar", "Vacuum Sealed", "Bulk Bag", "Other"] as const;
export const collectionTobaccoStatusOptions = ["Sealed", "Aging", "In Rotation", "Finished"] as const;
export const collectionPipeShapeOptions = ["Billiard", "Bent Billiard", "Dublin", "Apple", "Brandy", "Pot", "Bulldog", "Canadian", "Churchwarden", "Poker", "Rhodesian", "Prince", "Freehand", "Other"] as const;
export const collectionPipeMaterialOptions = ["Briar", "Meerschaum", "Corn Cob", "Clay", "Other"] as const;
export const collectionPipeFinishOptions = ["Smooth", "Sandblast", "Rusticated", "Carved", "Natural", "Other"] as const;
export const collectionPipeStemOptions = ["Vulcanite", "Acrylic", "Cumberland", "Horn", "Bamboo", "Other"] as const;
export const collectionPipeStatusOptions = ["Active", "Resting", "Display", "Retired"] as const;
export const collectionBottleStatusOptions = ["Sealed", "Open", "Getting Low", "Empty"] as const;

export const defaultCollectionCigarForm = {
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

export const defaultCollectionTobaccoForm = {
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

export const defaultCollectionPipeForm = {
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

export const defaultCollectionBottleForm = {
  name: "",
  distillery: "",
  spiritType: "",
  proof: "",
  age: "",
  status: "Sealed",
  notes: ""
};
