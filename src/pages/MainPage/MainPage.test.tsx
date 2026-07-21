import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import MainPage from "./MainPage";

// 자식 위젯은 스텁 — 여기선 MainPage의 데이터 배선(useQueries)과 인사/에러 로직만 검증.
vi.mock("../../components/TodayVerse", () => ({ default: () => <div /> }));
vi.mock("../../components/ProgressCard", () => ({ default: () => <div /> }));
vi.mock("../../components/StreakCard", () => ({ default: () => <div /> }));
vi.mock("../../components/ContributionGraph", () => ({ default: () => <div /> }));
vi.mock("../../components/RecentRecords", () => ({ default: () => <div /> }));

vi.mock("../../api/users", () => ({
  getMyProfile: vi.fn().mockResolvedValue({ displayName: "테스터" }),
  getUserProgress: vi.fn().mockResolvedValue({
    coveredVerses: 0,
    totalVerses: 31088,
    completedBooks: 0,
    progressRate: 0,
  }),
}));
vi.mock("../../api/verses", () => ({
  getTodayVerse: vi.fn().mockResolvedValue(null),
}));
vi.mock("../../api/stats", () => ({
  getMyStatistics: vi.fn().mockResolvedValue({
    currentStreak: 0,
    longestStreak: 0,
    totalCount: 0,
  }),
  getActivity: vi.fn().mockResolvedValue([]),
}));
vi.mock("../../api/writingSessions", () => ({
  getRecentWritingRecords: vi.fn().mockResolvedValue([]),
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("MainPage", () => {
  it("프로필 쿼리 resolve 후 인사 문구를 렌더한다", async () => {
    renderPage();
    // 로딩 중엔 Skeleton(aria-hidden)만 → 인사 문구는 아직 없음
    expect(screen.queryByText(/안녕하세요/)).toBeNull();
    // 쿼리 resolve 후 인사 노출
    expect(
      await screen.findByText("안녕하세요, 테스터님 👋"),
    ).toBeInTheDocument();
  });
});
