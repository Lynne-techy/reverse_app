// 사용자 관련

import { apiRequest } from "./client";

export interface UserProfile {
  id: string;
  email: string;
  provider: "google" | "kakao";
  displayName: string | null;
  avatarUrl: string | null;
  language: "ko" | "en";
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