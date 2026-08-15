// 사용자 관련

import { apiRequest } from "./client";
import type { Verse } from "./verses";

export interface UserProfile {
  id: string;
  email: string | null;
  provider: "google" | "kakao";
  displayName: string | null;
  avatarUrl: string | null;
  language: "ko" | "en";
  isNewUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  coveredVerses: number;
  totalVerses: number;
  completedBooks: number;
  progressRate: number;
}

export function getMyProfile() {
  return apiRequest<UserProfile>("/users/me");
}

export function getUserProgress() {
  return apiRequest<UserProgress>("/users/me/progress");
}

/** GET /users/me/books/:bookNo/key-verse 응답 — 지정한 대표절이 없으면 null. */
export interface BookKeyVerseResponse {
  keyVerse: Verse | null;
}

/**
 * 유저가 그 권에서 통과 필사하며 대표절로 지정한 절 중 하나를 서버가 랜덤으로 골라 준다
 * (고유 절 균등 — 자주 고른 절이 더 자주 뽑히지 않음). 밤하늘 대표 문구용.
 */
export function getBookKeyVerse(bookNo: number, signal?: AbortSignal) {
  return apiRequest<BookKeyVerseResponse>(`/users/me/books/${bookNo}/key-verse`, { signal });
}
