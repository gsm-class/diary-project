"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { SignUpState } from "./actions";
import { signUpAction } from "./actions";

const initialState: SignUpState = null;

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none ring-offset-white placeholder:text-slate-400 focus:border-teal-deep focus:bg-white focus:ring-2 focus:ring-mint/25 disabled:opacity-60"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={pending}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none ring-offset-white placeholder:text-slate-400 focus:border-teal-deep focus:bg-white focus:ring-2 focus:ring-mint/25 disabled:opacity-60"
          placeholder="6자 이상"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="passwordConfirm"
          className="text-sm font-medium text-slate-700"
        >
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={pending}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none ring-offset-white placeholder:text-slate-400 focus:border-teal-deep focus:bg-white focus:ring-2 focus:ring-mint/25 disabled:opacity-60"
          placeholder="비밀번호 다시 입력"
        />
      </div>

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
        {pending ? "처리 중…" : "회원가입"}
      </button>

      <p className="text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-semibold text-teal-deep underline-offset-4 hover:underline"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
