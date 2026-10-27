"use server";

import { redirect } from "next/navigation";

import { isMood } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { EntryFormState } from "@/types";

export async function updateEntryAction(
  entryId: string,
  _prevState: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const titleRaw = formData.get("title")?.toString().trim() ?? "";
  const body = formData.get("body")?.toString() ?? "";
  const moodRaw = formData.get("mood")?.toString() ?? "";

  const bodyTrimmed = body.trim();
  if (!bodyTrimmed) {
    return { error: "본문을 입력해 주세요." };
  }

  if (!moodRaw || !isMood(moodRaw)) {
    return { error: "기분을 선택해 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("entries")
    .update({
      title: titleRaw.length > 0 ? titleRaw : null,
      body: bodyTrimmed,
      mood: moodRaw,
    })
    .eq("id", entryId)
    .select("id");

  if (error) {
    return {
      error:
        error.message ||
        "일기를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!data || data.length === 0) {
    return {
      error: "일기를 찾을 수 없거나 수정할 수 없습니다.",
    };
  }

  redirect(`/entries/${entryId}`);
}
