import type { CatalogStore } from "@/lib/catalog";
import { normalizeCatalogText } from "@/lib/catalog";

export const seedCatalog: CatalogStore = {
  brands: [
    { id: "pt-peterson", type: "pipeTobaccos", name: "Peterson", normalizedName: normalizeCatalogText("Peterson"), aliases: ["Dunhill"], status: "active", source: "seed", country: "Ireland" },
    { id: "pt-cd", type: "pipeTobaccos", name: "Cornell & Diehl", normalizedName: normalizeCatalogText("Cornell & Diehl"), aliases: ["C and D", "C&D"], status: "active", source: "seed", country: "United States" },
    { id: "pt-macbaren", type: "pipeTobaccos", name: "Mac Baren", normalizedName: normalizeCatalogText("Mac Baren"), aliases: [], status: "active", source: "seed", country: "Denmark" },
    { id: "pt-sg", type: "pipeTobaccos", name: "Samuel Gawith", normalizedName: normalizeCatalogText("Samuel Gawith"), aliases: [], status: "active", source: "seed", country: "United Kingdom" },
    { id: "pt-orlik", type: "pipeTobaccos", name: "Orlik", normalizedName: normalizeCatalogText("Orlik"), aliases: [], status: "active", source: "seed", country: "Denmark" },
    { id: "pt-sutliff", type: "pipeTobaccos", name: "Sutliff", normalizedName: normalizeCatalogText("Sutliff"), aliases: [], status: "active", source: "seed", country: "United States" },
    { id: "pt-esoterica", type: "pipeTobaccos", name: "Esoterica", normalizedName: normalizeCatalogText("Esoterica"), aliases: ["Esoterica Tobacciana"], status: "limited", source: "seed", country: "United Kingdom" },
    { id: "pipe-peterson", type: "pipes", name: "Peterson", normalizedName: normalizeCatalogText("Peterson"), aliases: [], status: "active", source: "seed", country: "Ireland" },
    { id: "pipe-savinelli", type: "pipes", name: "Savinelli", normalizedName: normalizeCatalogText("Savinelli"), aliases: [], status: "active", source: "seed", country: "Italy" },
    { id: "pipe-dunhill", type: "pipes", name: "Dunhill", normalizedName: normalizeCatalogText("Dunhill"), aliases: ["Alfred Dunhill"], status: "active", source: "seed", country: "United Kingdom" },
    { id: "cigar-padron", type: "cigars", name: "Padron", normalizedName: normalizeCatalogText("Padron"), aliases: [], status: "active", source: "seed", country: "Nicaragua" },
    { id: "cigar-fuente", type: "cigars", name: "Arturo Fuente", normalizedName: normalizeCatalogText("Arturo Fuente"), aliases: ["Fuente"], status: "active", source: "seed", country: "Dominican Republic" },
    { id: "cigar-davidoff", type: "cigars", name: "Davidoff", normalizedName: normalizeCatalogText("Davidoff"), aliases: [], status: "active", source: "seed", country: "Dominican Republic" },
    { id: "spirit-buffalo-trace", type: "spirits", name: "Buffalo Trace", normalizedName: normalizeCatalogText("Buffalo Trace"), aliases: [], status: "active", source: "seed", country: "United States" },
    { id: "spirit-wild-turkey", type: "spirits", name: "Wild Turkey", normalizedName: normalizeCatalogText("Wild Turkey"), aliases: [], status: "active", source: "seed", country: "United States" },
    { id: "spirit-macallan", type: "spirits", name: "The Macallan", normalizedName: normalizeCatalogText("The Macallan"), aliases: ["Macallan"], status: "active", source: "seed", country: "Scotland" }
  ],
  items: [
    { id: "blend-nightcap", type: "pipeTobaccos", brandId: "pt-peterson", name: "Nightcap", normalizedName: normalizeCatalogText("Nightcap"), aliases: [], status: "active", source: "seed", metadata: { blendFamily: "English", cutType: "Ribbon", components: ["Latakia", "Orientals", "Virginia", "Perique"], strength: "Medium-Full" } },
    { id: "blend-early-morning", type: "pipeTobaccos", brandId: "pt-peterson", name: "Early Morning Pipe", normalizedName: normalizeCatalogText("Early Morning Pipe"), aliases: ["EMP"], status: "active", source: "seed", metadata: { blendFamily: "English", cutType: "Ribbon", components: ["Latakia", "Orientals", "Virginia"], strength: "Mild-Medium" } },
    { id: "blend-elizabethan", type: "pipeTobaccos", brandId: "pt-peterson", name: "Elizabethan Mixture", normalizedName: normalizeCatalogText("Elizabethan Mixture"), aliases: [], status: "active", source: "seed", metadata: { blendFamily: "VaPer", cutType: "Coin", components: ["Virginia", "Perique"], strength: "Medium" } },
    { id: "blend-bayou", type: "pipeTobaccos", brandId: "pt-cd", name: "Bayou Morning", normalizedName: normalizeCatalogText("Bayou Morning"), aliases: [], status: "active", source: "seed", metadata: { blendFamily: "VaPer", cutType: "Ribbon", components: ["Virginia", "Perique"], strength: "Full" } },
    { id: "blend-haust", type: "pipeTobaccos", brandId: "pt-cd", name: "Haunted Bookshop", normalizedName: normalizeCatalogText("Haunted Bookshop"), aliases: [], status: "active", source: "seed", metadata: { blendFamily: "Burley", cutType: "Ribbon", components: ["Burley", "Virginia", "Perique"], strength: "Medium-Full" } },
    { id: "blend-1q", type: "pipeTobaccos", brandId: "pt-sutliff", name: "1-Q", normalizedName: normalizeCatalogText("1-Q"), aliases: ["1Q"], status: "active", source: "seed", metadata: { blendFamily: "Aromatic", cutType: "Ribbon", components: ["Cavendish", "Virginia"], strength: "Mild" } },
    { id: "blend-golden-sliced", type: "pipeTobaccos", brandId: "pt-orlik", name: "Golden Sliced", normalizedName: normalizeCatalogText("Golden Sliced"), aliases: [], status: "active", source: "seed", metadata: { blendFamily: "Virginia", cutType: "Flake", components: ["Virginia", "Perique"], strength: "Mild-Medium" } },
    { id: "blend-fvf", type: "pipeTobaccos", brandId: "pt-sg", name: "Full Virginia Flake", normalizedName: normalizeCatalogText("Full Virginia Flake"), aliases: ["FVF"], status: "active", source: "seed", metadata: { blendFamily: "Virginia", cutType: "Flake", components: ["Virginia"], strength: "Medium" } },
    { id: "blend-penzance", type: "pipeTobaccos", brandId: "pt-esoterica", name: "Penzance", normalizedName: normalizeCatalogText("Penzance"), aliases: [], status: "limited", source: "seed", metadata: { blendFamily: "Balkan", cutType: "Broken Flake", components: ["Latakia", "Orientals", "Virginia"], strength: "Medium" } },
    { id: "pipe-999", type: "pipes", brandId: "pipe-peterson", name: "999", normalizedName: normalizeCatalogText("999"), aliases: [], status: "active", source: "seed", metadata: { maker: "Peterson", shape: "Bent Rhodesian", material: "Briar" } },
    { id: "pipe-316ks", type: "pipes", brandId: "pipe-savinelli", name: "316 KS", normalizedName: normalizeCatalogText("316 KS"), aliases: [], status: "active", source: "seed", metadata: { maker: "Savinelli", shape: "Prince", material: "Briar" } },
    { id: "cigar-1964-prince", type: "cigars", brandId: "cigar-padron", name: "1964 Anniversary Principe", normalizedName: normalizeCatalogText("1964 Anniversary Principe"), aliases: [], status: "active", source: "seed", metadata: { line: "1964 Anniversary", vitola: "Principe", wrapper: "Natural" } },
    { id: "cigar-hemingway", type: "cigars", brandId: "cigar-fuente", name: "Hemingway Short Story", normalizedName: normalizeCatalogText("Hemingway Short Story"), aliases: [], status: "active", source: "seed", metadata: { line: "Hemingway", vitola: "Short Story" } },
    { id: "spirit-eagle-rare-10", type: "spirits", brandId: "spirit-buffalo-trace", name: "Eagle Rare 10", normalizedName: normalizeCatalogText("Eagle Rare 10"), aliases: ["Eagle Rare"], status: "active", source: "seed", metadata: { spiritType: "Bourbon", expression: "10 Year", proof: 90, ageStatement: "10 years" } },
    { id: "spirit-rare-breed", type: "spirits", brandId: "spirit-wild-turkey", name: "Rare Breed", normalizedName: normalizeCatalogText("Rare Breed"), aliases: [], status: "active", source: "seed", metadata: { spiritType: "Bourbon", expression: "Barrel Proof", proof: 116.8 } },
    { id: "spirit-macallan-12", type: "spirits", brandId: "spirit-macallan", name: "Sherry Oak 12", normalizedName: normalizeCatalogText("Sherry Oak 12"), aliases: ["Macallan 12"], status: "active", source: "seed", metadata: { spiritType: "Scotch", expression: "Sherry Oak 12", proof: 86, ageStatement: "12 years" } }
  ]
};
