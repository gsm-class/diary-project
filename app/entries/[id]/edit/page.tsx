import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EntryForm } from "../../entry-form";
import { isMood } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Mood } from "@/types";

import { updateEntryAction } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

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
    return { title: `일기 수정 — ${entry.title} — ${base}` };
  }
  return { title: `일기 수정 — ${base}` };
}

export default async function EditEntryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("entries")
    .select("id, title, body, mood")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
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

  const initialMood: Mood | undefined = isMood(entry.mood)
    ? entry.mood
    : undefined;

  const boundUpdate = updateEntryAction.bind(null, entry.id);

  return (
    <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-400">
              일기 편집
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              일기 수정
            </h1>
          </div>
          <Link
            href={`/entries/${entry.id}`}
            className="inline-flex h-10 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            상세로
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <EntryForm
            action={boundUpdate}
            submitLabel="수정 저장"
            pendingLabel="저장 중…"
            initialTitle={entry.title ?? ""}
            initialBody={entry.body}
            initialMood={initialMood}
          />
        </div>
      </div>
    </div>
  );
}
