import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PilsaPage from "./PilsaPage";

// PilsaPage는 외부 API/라우터 훅 의존이 없는 자기완결 화면(저장은 아직 목업)이라
// 렌더 스모크로 크래시 없이 핵심 골격이 뜨는지만 검증한다.
describe("PilsaPage", () => {
  it("필사 화면이 렌더된다(제목·단계·진행 버튼)", () => {
    render(
      <MemoryRouter>
        <PilsaPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "성경 필사" })).toBeInTheDocument();
    expect(screen.getByText("DAILY PILSA")).toBeInTheDocument();
    // 5단계 진행 표시(범위 선택이 1단계)
    expect(screen.getByText("범위 선택")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
  });
});
