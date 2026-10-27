import type { Metadata } from "next";
import Link from "next/link";

import { NewEntryForm } from "./new-entry-form";

export const metadata: Metadata = {
  title: "새 일기 — 나만의 일기장",
  description: "오늘의 일기를 작성합니다.",
};

export default function NewEntryPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-400">
              새 일기 작성
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              새 일기
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            목록으로
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <NewEntryForm />
        </div>
      </div>
    </div>
  );
}
