"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function deleteEntryAction(
  entryId: string,
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return {
      error:
        error.message ||
        "일기를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!data || data.length === 0) {
    return {
      error: "일기를 찾을 수 없거나 삭제할 수 없습니다.",
    };
  }

  redirect("/");
}
