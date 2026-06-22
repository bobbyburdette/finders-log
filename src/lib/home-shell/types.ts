import type { CigarEntry } from "@/lib/cigar-journal";
import type { PipeEntry } from "@/lib/pipe-journal";
import type { SpiritEntry } from "@/lib/spirit-journal";

export type View =
  | "home"
  | "collection"
  | "collectionForm"
  | "collectionDetail"
  | "picker"
  | "form"
  | "detail"
  | "profile";
export type Category = "cigar" | "pipe" | "spirits";
export type JournalEntry = PipeEntry | CigarEntry | SpiritEntry;
export type CollectionTab = "humidor" | "cellar" | "bar";
export type CollectionFormKind = "cigar" | "tobacco" | "pipe" | "bottle";
export type CollectionDetailKind = CollectionFormKind;
export type CollectionWishlistKind = "cigar" | "pipe" | "bottle";
export type SocialAuthProvider = "google" | "apple" | "facebook";
