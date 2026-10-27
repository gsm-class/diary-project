import type { Metadata } from "next";

import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "회원가입 — 나만의 일기장",
  description: "새 계정을 만들고 일기를 시작하세요.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            회원가입
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            이메일과 비밀번호로 계정을 만듭니다.
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
