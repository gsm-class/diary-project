"use server";

import { redirect } from "next/navigation";

import { isMood } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { EntryFormState } from "@/types";

export async function createEntryAction(
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

  const { error } = await supabase.from("entries").insert({
    user_id: user.id,
    title: titleRaw.length > 0 ? titleRaw : null,
    body: bodyTrimmed,
    mood: moodRaw,
  });

  if (error) {
    return {
      error:
        error.message || "일기를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  redirect("/");
}
