import { NextResponse } from "next/server";

import { getSupabaseEnv, SUPABASE_ENV_INVALID_MESSAGE } from "@/lib/supabase/env";

/**
 * Connection check: calls the project REST endpoint so you can verify env vars
 * and reachability (browser Network tab, curl, or `fetch` in the devtools console).
 */
export async function GET() {
  const env = getSupabaseEnv();
  if (!env) {
    return NextResponse.json(
      { ok: false, error: SUPABASE_ENV_INVALID_MESSAGE },
      { status: 503 },
    );
  }

  const { url, anonKey } = env;

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    const ok = res.status >= 200 && res.status < 500;

    return NextResponse.json({
      ok,
      status: res.status,
      message: ok
        ? "Supabase REST responded (connection OK)"
        : "Unexpected response from Supabase",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 502 },
    );
  }
}
