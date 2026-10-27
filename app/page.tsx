import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isMood, MOOD_LABELS } from "@/lib/constants";
import { getSupabaseEnv, SUPABASE_ENV_INVALID_MESSAGE } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "나만의 일기장",
  description: "내 일기 목록",
};

function previewBody(body: string, maxLen = 120): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen).trimEnd()}…`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function moodLabel(mood: string): string {
  return isMood(mood) ? MOOD_LABELS[mood] : mood;
}

export default async function Home() {
  if (!getSupabaseEnv()) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-3xl border border-amber-200/90 bg-amber-50 px-8 py-10 text-center shadow-sm">
          <p className="text-sm leading-relaxed text-amber-950">
            {SUPABASE_ENV_INVALID_MESSAGE}
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("entries")
    .select("id, title, body, mood, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <section className="mb-8 rounded-3xl bg-teal-deep px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                내 기록
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                내 일기
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
                오늘의 기록을 모아 둡니다.
              </p>
            </div>
            <Link
              href="/entries/new"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-mint px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-mint/90"
            >
              새 일기 쓰기
            </Link>
          </div>
        </section>

        {error ? (
          <p
            className="rounded-3xl border border-app-rose/25 bg-app-rose/[0.06] px-5 py-4 text-sm text-app-rose"
            role="alert"
          >
            일기를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : !rows || rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              아직 작성한 일기가 없습니다.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              첫 일기를 남겨 보세요.
            </p>
            <Link
              href="/entries/new"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-mint px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-mint/90"
            >
              새 일기 쓰기
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {rows.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/entries/${entry.id}`}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300/90 hover:shadow-md sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {entry.title?.trim()
                        ? entry.title
                        : "제목 없음"}
                    </h2>
                    <time
                      dateTime={entry.created_at}
                      className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
                    >
                      {formatDate(entry.created_at)}
                    </time>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    기분:{" "}
                    <span className="font-semibold text-teal-deep">
                      {moodLabel(entry.mood)}
                    </span>
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {previewBody(entry.body)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
