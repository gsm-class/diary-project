import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "로그인 — 나만의 일기장",
  description: "이메일과 비밀번호로 로그인하세요.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            로그인
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            이메일과 비밀번호로 들어옵니다.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
