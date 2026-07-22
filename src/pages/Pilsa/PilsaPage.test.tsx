import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

// PilsaPage는 이제 api 모듈(→ lib/supabase)에 의존한다. 테스트 env엔 VITE_SUPABASE_*가
// 없어 createClient가 throw하므로 모듈만 목킹한다. 초기 렌더(step 1)에선 verse 범위 조회가
// 비활성(enabled=false)이라 실제 요청은 나가지 않는다.
vi.mock("../../lib/supabase", () => ({ supabase: {} }));

import PilsaPage from "./PilsaPage";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PilsaPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("PilsaPage", () => {
  it("필사 화면이 렌더된다(제목·단계·진행 버튼)", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "성경 필사" })).toBeInTheDocument();
    expect(screen.getByText("DAILY PILSA")).toBeInTheDocument();
    // 5단계 진행 표시(범위 선택이 1단계)
    expect(screen.getByText("범위 선택")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
  });
});
