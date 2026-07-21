import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// getWritingSession은 spy로 대체하므로 실제 supabase 클라이언트 생성은 불필요.
// (테스트 env엔 VITE_SUPABASE_* 가 없어 createClient가 throw → 모듈만 목킹)
vi.mock("../lib/supabase", () => ({ supabase: {} }));

import * as api from "../api/writingSessions";
import { useWritingSessionStatus } from "./useWritingSessionStatus";

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const baseSession: api.WritingSession = {
  id: "s1",
  userId: "u1",
  bookNo: 19,
  chapter: 23,
  startVerseNo: 1,
  endVerseNo: 6,
  keyVerseId: 9,
  language: "ko",
  objectKey: "u1/s1.jpg",
  status: "processing",
  recognizedText: null,
  similarityScore: null,
  passed: null,
  clientDate: "2026-07-21",
  meditation: null,
  application: null,
  prayer: null,
  createdAt: "2026-07-21T00:00:00Z",
  completedAt: null,
};

describe("isTerminalStatus", () => {
  it("completed/failed만 terminal이다", () => {
    expect(api.isTerminalStatus("completed")).toBe(true);
    expect(api.isTerminalStatus("failed")).toBe(true);
    expect(api.isTerminalStatus("processing")).toBe(false);
    expect(api.isTerminalStatus("pending")).toBe(false);
    expect(api.isTerminalStatus("uploaded")).toBe(false);
  });
});

describe("useWritingSessionStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sessionId가 있으면 세션 상태를 조회한다", async () => {
    const spy = vi
      .spyOn(api, "getWritingSession")
      .mockResolvedValue({ ...baseSession, status: "processing" });

    const { result } = renderHook(() => useWritingSessionStatus("s1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() =>
      expect(result.current.data?.status).toBe("processing"),
    );
    expect(spy).toHaveBeenCalledWith("s1", expect.anything());
  });

  it("sessionId가 null이면 요청하지 않는다(비활성)", () => {
    const spy = vi.spyOn(api, "getWritingSession");

    const { result } = renderHook(() => useWritingSessionStatus(null), {
      wrapper: makeWrapper(),
    });

    expect(spy).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });
});
