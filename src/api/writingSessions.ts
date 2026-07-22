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
  return apiRequest<WritingRecord[]>("/writing-sessions?limit=5&offset=0");
}

// ───────── 필사 제출·상태 폴링 (백엔드 writing-sessions 흐름) ─────────

export type WritingSessionStatus = "pending" | "uploaded" | "processing" | "completed" | "failed";

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

/**
 * presigned URL로 이미지 파일을 스토리지에 직접 PUT 업로드한다.
 *
 * 주의: 이 요청 대상은 우리 백엔드(/api)가 아니라 스토리지(S3 등)라서 apiRequest를
 * 쓰지 않는다. apiRequest는 모든 요청에 `Authorization: Bearer ...`를 붙이는데,
 * presigned URL은 쿼리스트링 서명 자체가 인증이라 Bearer 헤더가 끼면 서명이 깨진다.
 * 그래서 순수 fetch로 보낸다.
 *
 * 5xx(스토리지 일시 장애)만 백오프 후 재시도하고, 4xx(잘못된 요청·만료된 서명)는
 * 재시도해도 같은 결과라 즉시 포기한다. 외부 signal이 취소되면 재시도하지 않고 전파한다.
 *
 * @param uploadUrl createUploadUrl이 준 presigned PUT URL
 * @param file 업로드할 이미지 파일
 * @param signal 화면 이탈 등으로 업로드를 취소하기 위한 외부 signal
 */
const UPLOAD_MAX_RETRIES = 2; // 5xx일 때만 쓰는 "추가" 시도 횟수 (총 시도 = 1 + 2)
const uploadSleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function uploadImageToStorage(
  uploadUrl: string,
  file: File,
  signal?: AbortSignal,
): Promise<void> {
  for (let attempt = 0; attempt <= UPLOAD_MAX_RETRIES; attempt++) {
    // 백오프 대기 중 취소됐을 수 있으니, 새 시도를 시작하기 전에 먼저 확인.
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    let response: Response;
    try {
      response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
        signal,
      });
    } catch (err) {
      // 여긴 "네트워크 자체가 끊김"(fetch가 던진 경우)만 온다.
      // 외부 취소로 인한 AbortError면 재시도하지 않고 그대로 전파.
      if (signal?.aborted) throw err;
      // 그 외 네트워크 오류 → 일시적일 수 있으니 마지막 시도가 아니면 재시도.
      if (attempt === UPLOAD_MAX_RETRIES) throw err;
      await uploadSleep(300 * (attempt + 1));
      continue;
    }

    if (response.ok) return; // resolve = 성공. caller는 pending 상태로 버튼을 잠근다.

    // Storage가 준 실제 실패 사유 — 사용자 메시지엔 안 쓰지만 콘솔엔 남겨 디버깅에 쓴다.
    // (presigned URL은 우리 /api를 거치지 않아 서버 로그로는 원인을 못 보므로 특히 중요.)
    console.error(
      `이미지 업로드 실패 (${response.status}):`,
      await response.text().catch(() => "(응답 본문 없음)"),
    );

    // 4xx → 재시도 무의미, 즉시 포기.
    if (response.status < 500) {
      throw new Error(`이미지 업로드에 실패했습니다. (${response.status})`);
    }

    // 5xx → 마지막 시도였으면 포기, 아니면 백오프 후 재시도.
    if (attempt === UPLOAD_MAX_RETRIES) {
      throw new Error(`이미지 업로드에 실패했습니다. (${response.status})`);
    }
    await uploadSleep(300 * (attempt + 1));
  }
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
export function completeWritingSession(sessionId: string, body: CompleteWritingSessionBody) {
  return apiRequest<WritingSession>(`/writing-sessions/${sessionId}/complete`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** 세션 단건 조회 (검사 상태 폴링용). */
export function getWritingSession(sessionId: string, signal?: AbortSignal) {
  return apiRequest<WritingSession>(`/writing-sessions/${sessionId}`, {
    signal,
  });
}
