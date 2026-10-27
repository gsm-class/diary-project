/** Supabase 대시보드 Settings → API 의 Project URL / anon public 키 */
export const SUPABASE_ENV_INVALID_MESSAGE =
  "Supabase 환경 변수가 없거나 올바르지 않습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL(예: https://xxxx.supabase.co)과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요. (대시보드 Settings → API)";

export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
  } catch {
    return null;
  }
  return { url, anonKey };
}
