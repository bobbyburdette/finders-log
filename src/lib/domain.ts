export type EntryCategory = "pipe" | "cigar" | "spirits";

export type JournalFilter = "all" | EntryCategory;

export type JournalSort = "newest" | "oldest" | "az" | "faves" | "top";

export interface ProductVisionCard {
  title: string;
  body: string;
}

export const homeFilters: Array<{ value: JournalFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "cigar", label: "Cigar" },
  { value: "pipe", label: "Pipe" },
  { value: "spirits", label: "Spirits" }
];

export const homeSorts: Array<{ value: JournalSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A to Z" },
  { value: "faves", label: "Faves" },
  { value: "top", label: "Top Rated" }
];

export const productionMilestones: ProductVisionCard[] = [
  {
    title: "Accounts and identity",
    body: "Move from browser-only state to real accounts, auth, and private cloud data."
  },
  {
    title: "Journal and collection APIs",
    body: "Replace local storage with a typed API boundary that can scale with mobile and web clients."
  },
  {
    title: "Monetization foundation",
    body: "Create the seams for subscriptions, premium features, and billing without rewriting the app shell."
  }
];
