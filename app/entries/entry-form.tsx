"use client";

import { useActionState } from "react";

import { MOODS } from "@/lib/constants";
import type { EntryFormState, Mood } from "@/types";

type EntryFormProps = {
  action: (
    _prevState: EntryFormState,
    formData: FormData,
  ) => Promise<EntryFormState>;
  submitLabel?: string;
  pendingLabel?: string;
  /** 수정 모드 — 기존 값으로 필드 채움 */
  initialTitle?: string;
  initialBody?: string;
  initialMood?: Mood;
};

const initialState: EntryFormState = null;

export function EntryForm({
  action,
  submitLabel = "저장하기",
  pendingLabel = "저장 중…",
  initialTitle = "",
  initialBody = "",
  initialMood,
}: EntryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          제목{" "}
          <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialTitle}
          disabled={pending}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none ring-offset-white placeholder:text-slate-400 focus:border-teal-deep focus:bg-white focus:ring-2 focus:ring-mint/25 disabled:opacity-60"
          placeholder="오늘의 한 줄"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="body" className="text-sm font-medium text-slate-700">
          본문
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={8}
          defaultValue={initialBody}
          disabled={pending}
          className="resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none ring-offset-white placeholder:text-slate-400 focus:border-teal-deep focus:bg-white focus:ring-2 focus:ring-mint/25 disabled:opacity-60"
          placeholder="오늘 있었던 일을 적어 보세요."
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-slate-700">기분</legend>
        <div className="flex flex-wrap gap-3">
          {MOODS.map((m) => (
            <label
              key={m.value}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors has-[:checked]:border-teal-deep has-[:checked]:bg-teal-deep/5 has-[:checked]:text-teal-deep"
            >
              <input
                type="radio"
                name="mood"
                value={m.value}
                required
                defaultChecked={initialMood === m.value}
                disabled={pending}
                className="border-slate-300 text-mint focus:ring-mint/30"
              />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      {state?.error ? (
        <p
          className="rounded-xl border border-app-rose/25 bg-app-rose/[0.06] px-4 py-3 text-sm text-app-rose"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 flex h-12 w-full items-center justify-center rounded-lg bg-mint px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-mint/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
