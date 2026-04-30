export type DataProvider = "browser" | "supabase";

const configuredProvider = process.env.NEXT_PUBLIC_DATA_PROVIDER;
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

export const backendConfig = {
  currentDataProvider: (
    configuredProvider === "browser" ? "browser" : hasSupabaseConfig ? "supabase" : "browser"
  ) as DataProvider,
  targetDataProvider: "supabase" as DataProvider,
  apiBaseUrl: configuredApiBaseUrl,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
};
