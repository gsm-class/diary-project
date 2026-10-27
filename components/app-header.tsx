import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function AppHeader() {
  if (!getSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_0_rgb(0_0_0_/_.03)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-[15px] font-semibold text-teal-deep transition-opacity hover:opacity-80"
        >
          나만의 일기장
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
