"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string } | null;

function mapAuthError(error: AuthError): string {
  const code = error.code;
  const msg = error.message.toLowerCase();

  if (
    code === "invalid_credentials" ||
    msg.includes("invalid login") ||
    msg.includes("invalid email or password")
  ) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (code === "email_not_confirmed") {
    return "이메일 인증을 완료한 후 다시 로그인해 주세요.";
  }
  if (
    code === "user_banned" ||
    msg.includes("banned") ||
    msg.includes("disabled")
  ) {
    return "이 계정으로는 로그인할 수 없습니다.";
  }

  return error.message || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function signInAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email) {
    return { error: "이메일을 입력해 주세요." };
  }
  if (!password) {
    return { error: "비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapAuthError(error) };
  }

  redirect("/");
}
