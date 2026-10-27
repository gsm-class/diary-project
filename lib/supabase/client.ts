import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv, SUPABASE_ENV_INVALID_MESSAGE } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(SUPABASE_ENV_INVALID_MESSAGE);
  }

  return createBrowserClient(env.url, env.anonKey);
}
