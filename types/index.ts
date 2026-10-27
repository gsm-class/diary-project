/** 기분 — DB·API와 동일한 5가지 고정 값 */
export type Mood = "happy" | "calm" | "tired" | "sad" | "angry";

export interface Entry {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  mood: Mood;
  created_at: string;
  updated_at: string;
}

/** Server Action 공통 반환 형태 */
export interface ActionResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

/** 일기 작성·수정 폼 Server Action 에러 상태 */
export type EntryFormState = { error: string } | null;
