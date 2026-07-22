import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// useAuth는 Supabase에 붙으므로 스모크에선 목킹한다(미로그인 상태 가정).
const signInWithGoogle = vi.fn();
vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    session: null,
    user: null,
    accessToken: null,
    isLoading: false,
    signInWithGoogle,
    signOut: vi.fn(),
  }),
}));

import LoginPage from "./LoginPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  it("온보딩을 먼저 보여준다", () => {
    renderPage();
    expect(screen.getByText("성경을 읽지 말고, 쓰세요")).toBeInTheDocument();
  });

  it("건너뛰면 구글 로그인 카드로 전환되고, 버튼 클릭 시 구글 로그인을 시작한다", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "건너뛰기" }));

    expect(screen.getByText("환영합니다")).toBeInTheDocument();
    const googleBtn = screen.getByRole("button", { name: /Google로 시작하기/ });
    expect(googleBtn).toBeInTheDocument();

    await user.click(googleBtn);
    expect(signInWithGoogle).toHaveBeenCalledOnce();
  });
});
