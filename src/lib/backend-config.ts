export type DataProvider = "browser" | "supabase";

const configuredProvider = process.env.NEXT_PUBLIC_DATA_PROVIDER;
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const backendConfig = {
  currentDataProvider: (configuredProvider === "supabase" ? "supabase" : "browser") as DataProvider,
  targetDataProvider: "supabase" as DataProvider,
  apiBaseUrl: configuredApiBaseUrl,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
};
