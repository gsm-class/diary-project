# AGENTS.md — 이 프로젝트에서 AI가 지켜야 할 규칙

이 문서는 Next.js 웹사이트 개발 시 AI 에이전트(또는 코딩 보조 도구)가 **반복 설명 없이** 동일한 기준으로 코드를 작성하도록 정리한 프로젝트 규칙입니다.

---

## 기술 스택 (고정)

| 영역 | 선택 |
|------|------|
| 프레임워크 | **Next.js** — **App Router** (`app/` 디렉터리)만 사용 |
| 언어 | **TypeScript** (`.ts`, `.tsx`) |
| 스타일 | **Tailwind CSS** |
| 데이터베이스 / 백엔드 데이터 | **Supabase** (클라이언트·서버 연동, 인증·스토리지 포함 시 동일 스택 유지) |

---

## 반드시 지켜야 할 것 (DO)

### Next.js (App Router)

- 라우팅·레이아웃·로딩·에러 UI는 **`app/`** 아래에서 구성한다 (`pages/` 기반 Pages Router는 사용하지 않는다).
- 기본은 **서버 컴포넌트**를 쓰고, 상태·이벤트·브라우저 API가 필요할 때만 **`"use client"`** 로 클라이언트 컴포넌트를 분리한다.
- 데이터 페칭·환경에 맞는 로직은 **Server Actions**, **Route Handlers** (`app/api/.../route.ts`), **서버 컴포넌트**를 우선 고려한다.
- 메타데이터·SEO는 App Router 방식(`metadata` export 등)에 맞춘다.

### TypeScript

- 새 파일은 **`.ts` / `.tsx`** 로만 작성한다. **JavaScript(`.js`/`.jsx`)로 새 코드를 추가하지 않는다.**
- `any` 남용을 피하고, Supabase 쿼리 결과 등은 **타입을 정의하거나** 공식/생성된 타입을 활용한다.
- `strict` 모드와 프로젝트 `tsconfig.json` 설정을 존중한다.

### Tailwind CSS

- 스타일은 **Tailwind 유틸리티 클래스**를 기본으로 한다.
- 전역·공통 스타일은 **`globals.css`** 및 Tailwind 설정(`tailwind.config`)과 조화롭게 맞춘다.
- 컴포넌트별로 **인라인 `style` 남발**보다 Tailwind와 **일관된 디자인 토큰**(색·간격·타이포)을 우선한다.

### Supabase

- DB 접근은 **Supabase 클라이언트** 패턴을 따른다. 서버에서는 **서비스 롤/서버용 클라이언트**, 브라우저에서는 **anon 키 + RLS** 정책을 전제로 한다.
- **비밀 키(service role 등)는 클라이언트 번들에 넣지 않는다.** 환경 변수는 `NEXT_PUBLIC_` 접두사 규칙을 지킨다.
- **Row Level Security(RLS)** 를 전제로 쿼리·권한 설계를 맞춘다 (공개 데이터만 예외적으로 명시).

### 공통

- 요청 범위 밖의 **대규모 리팩터·불필요한 파일 추가**는 하지 않는다.
- 기존 코드 스타일·폴더 구조·import 순서를 **프로젝트와 동일하게** 맞춘다.

---

## 하면 안 되는 것 (DON'T)

### Next.js

- **`pages/` 디렉터리로 새 라우트를 만들거나**, Pages Router 전용 API(`getServerSideProps` 등)로 새 기능을 구현하지 않는다.
- 이미 App Router로 정리된 프로젝트에 **혼합 Router 구조**를 새로 도입하지 않는다.

### 언어·스타일

- **새 코드를 순수 JavaScript로 작성하지 않는다.**
- **CSS Modules / styled-components / emotion 등**을 이 프로젝트에 **임의로 새로 도입하지 않는다** (사용자가 명시적으로 요청한 경우만 예외).
- **인라인 스타일만으로 UI를 전부 구성**해 Tailwind와 체계가 어긋나게 하지 않는다.

### Supabase·보안

- **Service Role 키**를 `NEXT_PUBLIC_*` 로 노출하거나, 클라이언트 컴포넌트에서 사용하는 코드를 작성하지 않는다.
- RLS 없이 **민감한 테이블을 anon 클라이언트로 직접 열람·수정**하는 패턴을 기본으로 제안하지 않는다.

### AI 동작

- 사용자가 요청하지 않은 **불필요한 문서 파일**(README 대규모 개편, 여러 마크다운 가이드 남발)을 추가하지 않는다.
- **확인되지 않은 환경**을 가정해 패키지 버전·API를 막 바꾸지 않는다. 필요 시 `package.json`과 공식 문서 기준을 맞춘다.

---

## 한 줄 요약

**App Router + TypeScript + Tailwind + Supabase** 로만 확장하고, 서버/클라이언트 경계와 Supabase 보안(RLS·키 분리)을 지킨다.

---

*Next.js 프로젝트 루트에 이 파일을 두면, Cursor 등에서 프로젝트 컨텍스트로 참고하기 좋습니다.*
