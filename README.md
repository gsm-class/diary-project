# 나만의 일기장

Next.js(App Router) + TypeScript + Tailwind CSS + Supabase로 만든 일기 웹앱입니다.

## 요구 사항

- Node.js 18 이상
- npm(또는 호환 패키지 매니저)
- [Supabase](https://supabase.com) 프로젝트(인증·DB)

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 만들고 다음 값을 넣습니다. Supabase 대시보드 **Project Settings → API**에서 확인할 수 있습니다.

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon(공개) 키 — 클라이언트·미들웨어에서 사용. 서비스 롤 키는 넣지 마세요. |

`.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

## 데이터베이스

`entries` 테이블과 RLS 정책은 Supabase SQL Editor에서 프로젝트에 맞게 적용해야 합니다. (개발 계획서 Step 2 참고.)

## 실행 방법

의존성 설치:

```bash
npm install
```

개발 서버:

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

프로덕션 빌드:

```bash
npm run build
npm start
```

## 연결 확인

Supabase REST와 환경 변수가 올바른지 확인하려면 `GET /api/health/supabase` 응답을 확인하세요. (개발 중 `http://localhost:3000/api/health/supabase`)

## 기술 스택

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth + Postgres)
