# api-spec.md — 나만의 일기장 API 명세

> 프론트엔드와 백엔드가 주고받는 데이터를 정리한 문서.
> 구현 방식은 Next.js **Server Actions** 위주이며, 조회는 **Server Component**에서 직접 수행한다.

---

## 1. 공통 사항

### 1-1. 인증 방식

| 항목 | 내용 |
|------|------|
| 인증 수단 | Supabase Auth (이메일 + 비밀번호) |
| 세션 관리 | `@supabase/ssr` 쿠키 기반 세션 |
| 클라이언트 | 브라우저: `@supabase/supabase-js` (anon 키) |
| 서버 | `@supabase/ssr`로 쿠키에서 세션 읽기 |

### 1-2. 공통 타입

```typescript
// 기분 — 5가지 고정 값
type Mood = "happy" | "calm" | "tired" | "sad" | "angry";

// 일기 한 건
interface Entry {
  id: string;           // uuid
  user_id: string;      // uuid
  title: string | null; // 제목 (없으면 null)
  body: string;         // 본문
  mood: Mood;           // 기분
  created_at: string;   // ISO 8601 (예: "2026-03-27T09:00:00Z")
  updated_at: string;   // ISO 8601
}

// Server Action 공통 반환 타입
interface ActionResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 1-3. Mood 매핑 테이블

| 값 | 한글 라벨 |
|----|-----------|
| `happy` | 행복 |
| `calm` | 평온 |
| `tired` | 피곤 |
| `sad` | 슬픔 |
| `angry` | 화남 |

### 1-4. 인증 가드

비로그인 사용자가 `/`, `/entries/*` 에 접근하면 `/login`으로 리다이렉트한다.
로그인 사용자가 `/login`, `/signup`에 접근하면 `/`로 리다이렉트한다.
이 동작은 `middleware.ts`에서 처리한다.

---

## 2. 인증 API

### 2-1. 회원가입

| 항목 | 내용 |
|------|------|
| 함수명 | `signUpAction` (Server Action) |
| 페이지 | `/signup` |
| 호출 방식 | 폼 submit → Server Action |

**요청 (FormData)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `email` | string | O | 이메일 주소 |
| `password` | string | O | 비밀번호 (6자 이상, Supabase 기본) |
| `confirmPassword` | string | O | 비밀번호 확인 |

**요청 예시**

```
email: "user@example.com"
password: "mypassword123"
confirmPassword: "mypassword123"
```

**응답**

| 상황 | 동작 |
|------|------|
| 성공 | `/login`으로 리다이렉트 |
| 비밀번호 불일치 | 에러 메시지: "비밀번호가 일치하지 않습니다" |
| 이미 가입된 이메일 | 에러 메시지: "이미 사용 중인 이메일입니다" |
| 비밀번호 규칙 위반 | 에러 메시지: "비밀번호는 6자 이상이어야 합니다" |

**응답 예시 (에러 시)**

```json
{
  "success": false,
  "error": "비밀번호가 일치하지 않습니다"
}
```

---

### 2-2. 로그인

| 항목 | 내용 |
|------|------|
| 함수명 | `signInAction` (Server Action) |
| 페이지 | `/login` |
| 호출 방식 | 폼 submit → Server Action |

**요청 (FormData)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `email` | string | O | 이메일 주소 |
| `password` | string | O | 비밀번호 |

**요청 예시**

```
email: "user@example.com"
password: "mypassword123"
```

**응답**

| 상황 | 동작 |
|------|------|
| 성공 | `/`(홈)으로 리다이렉트 + 쿠키에 세션 저장 |
| 이메일/비밀번호 틀림 | 에러 메시지: "이메일 또는 비밀번호가 올바르지 않습니다" |

**응답 예시 (에러 시)**

```json
{
  "success": false,
  "error": "이메일 또는 비밀번호가 올바르지 않습니다"
}
```

---

### 2-3. 로그아웃

| 항목 | 내용 |
|------|------|
| 함수명 | `signOutAction` (Server Action) |
| 위치 | 헤더 로그아웃 버튼 |
| 호출 방식 | 버튼 클릭 → Server Action |

**요청**

없음 (세션 쿠키에서 사용자 식별)

**응답**

| 상황 | 동작 |
|------|------|
| 성공 | 쿠키 세션 삭제 → `/login`으로 리다이렉트 |

---

## 3. 일기 API

### 3-1. 일기 목록 조회

| 항목 | 내용 |
|------|------|
| 호출 방식 | Server Component에서 직접 Supabase 쿼리 |
| 페이지 | `/` (홈) |
| 정렬 | `created_at` 내림차순 (최신이 위) |

**요청**

없음 (서버에서 세션 쿠키로 `user_id`를 확인하고, RLS가 본인 데이터만 반환)

**Supabase 쿼리**

```typescript
const { data, error } = await supabase
  .from("entries")
  .select("id, title, body, mood, created_at, updated_at")
  .order("created_at", { ascending: false });
```

**응답 데이터: `Entry[]`**

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "좋은 하루",
    "body": "오늘은 날씨가 맑아서 기분이 좋았다. 산책도 하고...",
    "mood": "happy",
    "created_at": "2026-03-27T09:00:00Z",
    "updated_at": "2026-03-27T09:00:00Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "title": null,
    "body": "비가 와서 집에만 있었다...",
    "mood": "calm",
    "created_at": "2026-03-26T20:30:00Z",
    "updated_at": "2026-03-26T20:30:00Z"
  }
]
```

**화면 표시 규칙**
- `title`이 `null`이면 "제목 없음"으로 표시
- `body`는 목록에서 50자 정도만 미리보기로 표시
- 일기가 0건이면 "아직 작성한 일기가 없습니다" 메시지 표시

---

### 3-2. 일기 상세 조회

| 항목 | 내용 |
|------|------|
| 호출 방식 | Server Component에서 직접 Supabase 쿼리 |
| 페이지 | `/entries/[id]` |

**요청**

URL 파라미터에서 `id`를 가져온다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `id` | string (uuid) | O | 일기의 고유 ID |

**Supabase 쿼리**

```typescript
const { data, error } = await supabase
  .from("entries")
  .select("*")
  .eq("id", id)
  .single();
```

**응답 데이터: `Entry`**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_id": "u1234567-89ab-cdef-0123-456789abcdef",
  "title": "좋은 하루",
  "body": "오늘은 날씨가 맑아서 기분이 좋았다. 산책도 하고 카페에서 커피도 마셨다. 내일도 이런 날이면 좋겠다.",
  "mood": "happy",
  "created_at": "2026-03-27T09:00:00Z",
  "updated_at": "2026-03-27T09:00:00Z"
}
```

**에러 케이스**

| 상황 | 처리 |
|------|------|
| 존재하지 않는 `id` | 404 페이지 또는 `/`로 리다이렉트 |
| 다른 사용자의 일기 | RLS가 차단 → 데이터 없음 → 위와 동일 처리 |

---

### 3-3. 일기 작성

| 항목 | 내용 |
|------|------|
| 함수명 | `createEntryAction` (Server Action) |
| 페이지 | `/entries/new` |
| 호출 방식 | 폼 submit → Server Action |

**요청 (FormData)**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| `title` | string | X | 비어 있으면 `null`로 저장 |
| `body` | string | O | 빈 문자열 불가 |
| `mood` | Mood | O | `happy`, `calm`, `tired`, `sad`, `angry` 중 하나 |

**요청 예시**

```
title: "좋은 하루"
body: "오늘은 날씨가 맑아서 기분이 좋았다."
mood: "happy"
```

**Supabase 쿼리**

```typescript
const { data, error } = await supabase
  .from("entries")
  .insert({
    title: title || null,
    body,
    mood,
    user_id: session.user.id,
  })
  .select()
  .single();
```

**응답**

| 상황 | 동작 |
|------|------|
| 성공 | `/`(목록)으로 리다이렉트 |
| 본문 비어 있음 | 에러: "본문을 입력해주세요" |
| 기분 미선택 | 에러: "기분을 선택해주세요" |
| 유효하지 않은 mood 값 | 에러: "올바른 기분을 선택해주세요" |

**응답 예시 (에러 시)**

```json
{
  "success": false,
  "error": "본문을 입력해주세요"
}
```

---

### 3-4. 일기 수정

| 항목 | 내용 |
|------|------|
| 함수명 | `updateEntryAction` (Server Action) |
| 페이지 | `/entries/[id]/edit` |
| 호출 방식 | 폼 submit → Server Action |

**요청 (FormData)**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| `id` | string (uuid) | O | 수정할 일기 ID |
| `title` | string | X | 비어 있으면 `null`로 저장 |
| `body` | string | O | 빈 문자열 불가 |
| `mood` | Mood | O | `happy`, `calm`, `tired`, `sad`, `angry` 중 하나 |

**요청 예시**

```
id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
title: "좋은 하루 (수정)"
body: "오늘은 날씨가 맑아서 기분이 좋았다. 저녁엔 비가 왔다."
mood: "calm"
```

**Supabase 쿼리**

```typescript
const { data, error } = await supabase
  .from("entries")
  .update({
    title: title || null,
    body,
    mood,
  })
  .eq("id", id)
  .select()
  .single();
```

> `updated_at`은 DB 트리거가 자동으로 현재 시각으로 갱신한다.
> 요청 데이터에 `updated_at`을 보낼 필요 없음.

**응답**

| 상황 | 동작 |
|------|------|
| 성공 | `/entries/[id]`(상세)로 리다이렉트 |
| 본문 비어 있음 | 에러: "본문을 입력해주세요" |
| 기분 미선택 | 에러: "기분을 선택해주세요" |
| 존재하지 않는 일기 | 에러: "일기를 찾을 수 없습니다" |
| 다른 사용자의 일기 | RLS가 차단 → "일기를 찾을 수 없습니다" |

**응답 예시 (에러 시)**

```json
{
  "success": false,
  "error": "일기를 찾을 수 없습니다"
}
```

---

### 3-5. 일기 삭제

| 항목 | 내용 |
|------|------|
| 함수명 | `deleteEntryAction` (Server Action) |
| 위치 | `/entries/[id]` (상세 페이지) 삭제 버튼 |
| 호출 방식 | 삭제 확인 다이얼로그 → Server Action |

**요청 (FormData)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string (uuid) | O | 삭제할 일기 ID |

**요청 예시**

```
id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Supabase 쿼리**

```typescript
const { error } = await supabase
  .from("entries")
  .delete()
  .eq("id", id);
```

**응답**

| 상황 | 동작 |
|------|------|
| 성공 | `/`(목록)으로 리다이렉트 |
| 존재하지 않는 일기 | 에러: "일기를 찾을 수 없습니다" |
| 다른 사용자의 일기 | RLS가 차단 → "일기를 찾을 수 없습니다" |

**응답 예시 (에러 시)**

```json
{
  "success": false,
  "error": "일기를 찾을 수 없습니다"
}
```

---

## 4. DB 테이블 참조

### `entries` 테이블

| 컬럼 | 타입 | 제약 |
|------|------|------|
| `id` | uuid | PK, 기본값 `gen_random_uuid()` |
| `user_id` | uuid | NOT NULL, FK → `auth.users(id)`, ON DELETE CASCADE |
| `title` | text | NULL 허용 |
| `body` | text | NOT NULL |
| `mood` | text | NOT NULL (`happy`, `calm`, `tired`, `sad`, `angry`) |
| `created_at` | timestamptz | NOT NULL, 기본값 `now()` |
| `updated_at` | timestamptz | NOT NULL, 기본값 `now()`, 수정 시 트리거로 자동 갱신 |

### RLS 정책

모든 작업(SELECT, INSERT, UPDATE, DELETE)에서 `auth.uid() = user_id` 조건을 적용한다.
본인의 일기만 읽고, 쓰고, 고치고, 지울 수 있다.

---

## 5. 전체 데이터 흐름 요약

| 동작 | 호출 방식 | 요청 데이터 | 응답 / 이동 |
|------|-----------|-------------|-------------|
| 회원가입 | Server Action | email, password, confirmPassword | → `/login` |
| 로그인 | Server Action | email, password | → `/` |
| 로그아웃 | Server Action | 없음 | → `/login` |
| 목록 조회 | Server Component | 없음 (세션 자동) | `Entry[]` |
| 상세 조회 | Server Component | id (URL 파라미터) | `Entry` |
| 작성 | Server Action | title?, body, mood | → `/` |
| 수정 | Server Action | id, title?, body, mood | → `/entries/[id]` |
| 삭제 | Server Action | id | → `/` |

---

*이 문서는 spec.md와 함께 Phase 1 구현의 기준으로 삼는다.*
