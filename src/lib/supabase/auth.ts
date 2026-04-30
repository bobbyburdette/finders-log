import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SupabaseUserContext = {
  configured: boolean;
  userId: string | null;
  email: string | null;
};

export async function getSupabaseUserContext(): Promise<SupabaseUserContext> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      userId: null,
      email: null
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    configured: true,
    userId: user?.id ?? null,
    email: user?.email ?? null
  };
}
