"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type SignUpState = { error: string } | null;

function mapAuthError(error: AuthError): string {
  const code = error.code;
  const msg = error.message.toLowerCase();

  if (code === "user_already_exists" || msg.includes("already registered")) {
    return "이미 가입된 이메일입니다.";
  }
  if (code === "signup_disabled") {
    return "현재 회원가입이 비활성화되어 있습니다.";
  }
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    msg.includes("email rate limit") ||
    msg.includes("rate limit exceeded")
  ) {
    return "인증 메일 발송 한도에 걸렸습니다. Supabase 기본 메일은 시간당 횟수 제한이 있어, 잠시 후 다시 시도하거나 대시보드에서 커스텀 SMTP를 연결해 주세요. (개발 중에는 Authentication → Providers → Email에서 이메일 확인을 끄면 메일 없이 가입할 수 있습니다.)";
  }
  if (
    code === "email_address_invalid" ||
    msg.includes("invalid email") ||
    msg.includes("unable to validate email")
  ) {
    return "올바른 이메일 형식이 아닙니다.";
  }
  if (
    code === "weak_password" ||
    msg.includes("password") && (msg.includes("short") || msg.includes("least"))
  ) {
    return "비밀번호가 너무 짧거나 규칙에 맞지 않습니다.";
  }

  return error.message || "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const passwordConfirm = formData.get("passwordConfirm")?.toString() ?? "";

  if (!email) {
    return { error: "이메일을 입력해 주세요." };
  }
  if (!password) {
    return { error: "비밀번호를 입력해 주세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: mapAuthError(error) };
  }

  redirect("/login");
}
