// 필사 기록 관련

import { apiRequest } from "./client";

export interface WritingRecord {
  id: string;
  bookNo: number;
  chapter: number;
  startVerseNo: number;
  endVerseNo: number;
  language: "ko" | "en";
  clientDate: string | null;
  meditation: string | null;
  keyVerse: {
    chapter: number;
    verseNo: number;
  } | null;
  completedAt: string | null;
}

export function getRecentWritingRecords() {
  return apiRequest<WritingRecord[]>(
    "/writing-sessions?limit=5&offset=0",
  );
}