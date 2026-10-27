import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv, SUPABASE_ENV_INVALID_MESSAGE } from "@/lib/supabase/env";

export async function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(SUPABASE_ENV_INVALID_MESSAGE);
  }

  const { url, anonKey } = env;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component that cannot set cookies; middleware
          // should refresh the session when setAll is required.
        }
      },
    },
  });
}
