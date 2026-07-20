//  통계 관련

import { apiRequest } from "./client";

export interface MyStatistics {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalCount: number;
  lastWrittenDate: string | null;
  freezeAvailable: number;
  streakStart: {
    date: string;
    bookNo: number;
    bookName: string;
    chapter: number;
  } | null;
}

export interface DailyActivity {
  date: string;
  count: number;
}

export function getMyStatistics() {
  return apiRequest<MyStatistics>("/stats/me");
}

export function getActivity(from: string, to: string) {
  const query = new URLSearchParams({ from, to });

  return apiRequest<DailyActivity[]>(
    `/stats/activity?${query.toString()}`,
  );
}