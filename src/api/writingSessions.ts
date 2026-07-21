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

// ───────── 필사 제출·상태 폴링 (백엔드 writing-sessions 흐름) ─────────

export type WritingSessionStatus =
  | "pending"
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";

/** 검사가 끝나 더 이상 바뀌지 않는 상태(폴링 종료 조건). */
export function isTerminalStatus(status: WritingSessionStatus): boolean {
  return status === "completed" || status === "failed";
}

export interface WritingSession {
  id: string;
  userId: string;
  bookNo: number;
  chapter: number;
  startVerseNo: number;
  endVerseNo: number;
  keyVerseId: number | null;
  language: "ko" | "en";
  objectKey: string;
  status: WritingSessionStatus;
  recognizedText: string | null;
  similarityScore: number | null;
  passed: boolean | null;
  clientDate: string | null;
  meditation: string | null;
  application: string | null;
  prayer: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateUploadUrlBody {
  /** 성경 책 번호 (1~66) */
  book: number;
  chapter: number;
  startVerseNo: number;
  endVerseNo: number;
  language: "ko" | "en";
}

/** 세션 생성 + 업로드용 presigned URL 발급. 실제 이미지는 uploadUrl로 직접 PUT. */
export function createUploadUrl(body: CreateUploadUrlBody) {
  return apiRequest<{ sessionId: string; objectKey: string; uploadUrl: string }>(
    "/writing-sessions/upload-url",
    { method: "POST", body: JSON.stringify(body) },
  );
}

export interface CompleteWritingSessionBody {
  keyVerseId: number;
  /** 클라이언트 로컬 날짜 (YYYY-MM-DD) — 잔디/streak 기준일. */
  date: string;
  meditation?: string;
  application?: string;
  prayer?: string;
}

/**
 * 저장 + 유사도 검사 시작. 즉시 processing 상태 세션을 반환하므로
 * getWritingSession으로 completed/failed까지 폴링한다.
 */
export function completeWritingSession(
  sessionId: string,
  body: CompleteWritingSessionBody,
) {
  return apiRequest<WritingSession>(
    `/writing-sessions/${sessionId}/complete`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

/** 세션 단건 조회 (검사 상태 폴링용). */
export function getWritingSession(sessionId: string, signal?: AbortSignal) {
  return apiRequest<WritingSession>(`/writing-sessions/${sessionId}`, {
    signal,
  });
}