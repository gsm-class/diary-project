"use client";

import { useTransition } from "react";

import { deleteEntryAction } from "./actions";

type Props = {
  entryId: string;
};

export function DeleteEntryButton({ entryId }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            "이 일기를 삭제할까요? 이 작업은 되돌릴 수 없습니다.",
          )
        ) {
          return;
        }
        startTransition(async () => {
          const result = await deleteEntryAction(entryId);
          if (result?.error) {
            window.alert(result.error);
          }
        });
      }}
      className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-app-rose/35 bg-white px-5 text-sm font-semibold text-app-rose shadow-sm transition-colors hover:bg-app-rose/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}
