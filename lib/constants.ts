import type { Mood } from "@/types";

/** 기분 선택 UI·표시용 — value ↔ 한글 라벨 */
export const MOODS: { value: Mood; label: string }[] = [
  { value: "happy", label: "행복" },
  { value: "calm", label: "평온" },
  { value: "tired", label: "피곤" },
  { value: "sad", label: "슬픔" },
  { value: "angry", label: "화남" },
];

export const MOOD_LABELS: Record<Mood, string> = {
  happy: "행복",
  calm: "평온",
  tired: "피곤",
  sad: "슬픔",
  angry: "화남",
};

export function isMood(value: string): value is Mood {
  return MOODS.some((m) => m.value === value);
}
