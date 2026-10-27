# spec.md — 나만의 일기장

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **이름** | 나만의 일기장 |
| **스택** | Next.js (App Router) + TypeScript + Tailwind CSS + Supabase |
| **목적** | 개인용 일기 작성·조회·수정·삭제를 한 곳에서 관리하는 비공개 웹 앱 |

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | Next.js — App Router (`app/`) |
| 언어 | TypeScript |
| UI 스타일 | Tailwind CSS |
| 인증 | Supabase Auth (이메일 + 비밀번호) |
| 데이터베이스 | Supabase Postgres |
| 보안 | Row Level Security (RLS) — 본인 `user_id` 행만 접근 |

---

## Phase 1 기능 상세

### 1. 회원가입 / 로그인 / 로그아웃

| 항목 | 내용 |
|------|------|
| **동작** | 이메일·비밀번호로 계정을 만들고(`signUp`), 로그인(`signInWithPassword`), 세션 종료(`signOut`). 비로그인 사용자는 일기 기능 URL에 접근 시 로그인 페이지로 보낸다. |
| **페이지 경로** | `/login` — 로그인<br>`/signup` — 회원가입<br>(선택) `/auth/callback` — 이메일 확인 등 OAuth·링크 플로우 확장 시 |
| **Supabase** | Auth: `signUp`, `signInWithPassword`, `signOut`<br>클라이언트: `@supabase/supabase-js` 브라우저 클라이언트(anon 키)<br>서버: 필요 시 `@supabase/ssr` 로 쿠키 기반 세션 동기화 |

### 2. 일기 작성

| 항목 | 내용 |
|------|------|
| **동작** | 제목(선택·빈 값이면 NULL 또는 빈 문자열 정책 통일), 본문(필수), 기분(필수 선택 — 미리 정의된 값 중 하나). 저장 시 `user_id`는 현재 로그인 사용자로 자동 설정. |
| **페이지 경로** | `/entries/new` |
| **Supabase** | `entries` 테이블에 `insert` (RLS로 본인 `user_id`만 허용)<br>구현 패턴: Server Action 또는 Route Handler + 서버에서 세션 확인 후 삽입 권장 |

### 3. 일기 목록 조회

| 항목 | 내용 |
|------|------|
| **동작** | 로그인 사용자 본인의 일기만, **작성 시각 기준 내림차순**(최신이 위). 각 행에 제목(없으면 “제목 없음” 등 표시), 기분, 본문 일부 미리보기(선택), 날짜 표시. 항목 클릭 시 상세로 이동. |
| **페이지 경로** | `/` (홈) 또는 `/entries` — 프로젝트에서 하나로 통일 (여기서는 **`/` = 목록** 으로 가정) |
| **Supabase** | `entries` 에 대해 `select`, `order by created_at desc` (또는 `updated_at` 정책 명시)<br>RLS로 타 사용자 행은 조회 불가 |

### 4. 일기 상세 조회

| 항목 | 내용 |
|------|------|
| **동작** | 단일 일기의 제목, 본문, 기분, 작성일(및 수정일이 있으면 표시)를 읽기 전용으로 표시. 수정·삭제 진입 링크/버튼 제공. |
| **페이지 경로** | `/entries/[id]` (`id` = `entries.id` UUID) |
| **Supabase** | `select` 단건, `id` + `user_id` 조건(RLS가 있으면 `user_id`는 세션과 일치하는 행만 반환) |

### 5. 일기 수정

| 항목 | 내용 |
|------|------|
| **동작** | 기존 값을 폼에 채운 뒤 제목·본문·기분을 변경하고 저장. 본인 글만 수정 가능. |
| **페이지 경로** | `/entries/[id]/edit` |
| **Supabase** | `update` — `where id = ? and user_id = auth.uid()` (RLS로 강제)<br>`updated_at` 자동 갱신 권장(DB 트리거 또는 애플리케이션에서 설정) |

### 6. 일기 삭제

| 항목 | 내용 |
|------|------|
| **동작** | 상세 페이지 또는 수정 페이지에서 삭제 확인 후 제거. 본인 글만 삭제 가능. 완료 후 목록으로 이동. |
| **페이지 경로** | 별도 페이지 없이 **상세(`/entries/[id]`) 또는 수정(`/entries/[id]/edit`)** 에서 Server Action / 폼으로 처리 가능 |
| **Supabase** | `delete` — RLS로 본인 행만 삭제 허용 |

---

## DB 테이블 스키마 — `entries`

| 컬럼명 | 타입 | 제약 / 설명 |
|--------|------|----------------|
| `id` | `uuid` | `PRIMARY KEY`, 기본값 `gen_random_uuid()` |
| `user_id` | `uuid` | `NOT NULL`, `REFERENCES auth.users(id)` `ON DELETE CASCADE` |
| `title` | `text` | `NULL` 허용 (제목 없음 허용 시) |
| `body` | `text` | `NOT NULL` |
| `mood` | `text` | `NOT NULL` — Phase 1에서 허용 값은 앱과 동일하게 고정 (예: `happy`, `calm`, `tired`, `sad`, `angry` — 구현 시 한글 라벨과 매핑) |
| `created_at` | `timestamptz` | `NOT NULL`, 기본값 `now()` |
| `updated_at` | `timestamptz` | `NOT NULL`, 기본값 `now()` — 수정 시 갱신 |

**인덱스 (권장)**  
- `(user_id, created_at DESC)` — 목록 조회용

**RLS (요지)**  
- `SELECT` / `INSERT` / `UPDATE` / `DELETE` 모두 `auth.uid() = user_id` 인 행만 허용.

---

## 페이지 구조 (App Router)

`app/` 디렉터리 기준 라우트 예시:

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `app/page.tsx` | 로그인 시: 일기 목록 / 비로그인 시: 로그인 유도 또는 `/login` 리다이렉트 |
| `/login` | `app/login/page.tsx` | 로그인 폼 |
| `/signup` | `app/signup/page.tsx` | 회원가입 폼 |
| `/entries/new` | `app/entries/new/page.tsx` | 일기 작성 |
| `/entries/[id]` | `app/entries/[id]/page.tsx` | 일기 상세 |
| `/entries/[id]/edit` | `app/entries/[id]/edit/page.tsx` | 일기 수정 |

**공통**  
- `app/layout.tsx` — 루트 레이아웃, 전역 스타일  
- (선택) `app/entries/layout.tsx` — 일기 섹션 공통 네비게이션  

**API**  
- Phase 1은 Server Actions 위주로 두고, 필요 시 `app/api/.../route.ts` 는 최소화해도 됨.

---

## Phase 1 범위 외 (참고)

- 검색, 태그, 이미지 첨부, 캘린더 뷰, 통계, 공유·소셜 기능은 포함하지 않는다.

---

*이 문서는 Phase 1 구현의 단일 기준으로 삼는다.*
