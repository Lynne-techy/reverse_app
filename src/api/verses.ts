// 말씀 관련

import { apiRequest } from "./client";

export interface Verse {
  id: number;
  translationCode: string;
  bookNo: number;
  bookName: string;
  chapter: number;
  verseNo: number;
  text: string;
  createdAt: string;
}

export function getTodayVerse(date: string) {
  const query = new URLSearchParams({ date });

  return apiRequest<Verse>(
    `/verses/today?${query.toString()}`,
  );
}