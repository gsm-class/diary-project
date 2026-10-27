import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isMood, MOOD_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

import { DeleteEntryButton } from "./delete-entry-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("entries")
    .select("title")
    .eq("id", id)
    .maybeSingle();

  const base = "나만의 일기장";
  if (entry?.title?.trim()) {
    return { title: `${entry.title} — ${base}` };
  }
  return { title: `일기 상세 — ${base}` };
}

export default async function EntryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("entries")
    .select("id, title, body, mood, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <p
            className="rounded-3xl border border-app-rose/25 bg-app-rose/[0.06] px-5 py-4 text-sm text-app-rose"
            role="alert"
          >
            일기를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!entry) {
    notFound();
  }

  const displayTitle = entry.title?.trim() ? entry.title : "제목 없음";

  return (
    <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-teal-deep"
            >
              <span className="mr-1 text-slate-400">←</span>
              목록으로
            </Link>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
              {displayTitle}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <p>
                기분:{" "}
                <span className="font-semibold text-teal-deep">
                  {moodLabel(entry.mood)}
                </span>
              </p>
              <time dateTime={entry.created_at}>
                작성: {formatDate(entry.created_at)}
              </time>
              <time dateTime={entry.updated_at}>
                수정: {formatDate(entry.updated_at)}
              </time>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <Link
              href={`/entries/${entry.id}/edit`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-teal-deep px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-deep/90"
            >
              수정
            </Link>
            <DeleteEntryButton entryId={entry.id} />
          </div>
        </div>

        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-600">
            {entry.body}
          </div>
        </article>
      </div>
    </div>
  );
}
