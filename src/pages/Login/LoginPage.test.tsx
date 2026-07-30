import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const LAST_PROVIDER_KEY = "reverse:lastLoginProvider";

// useAuth는 Supabase에 붙으므로 스모크에선 목킹한다(미로그인 상태 가정).
const signInWithGoogle = vi.fn();
const signInWithKakao = vi.fn();
vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    session: null,
    user: null,
    accessToken: null,
    isLoading: false,
    signInWithGoogle,
    signInWithKakao,
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
  beforeEach(() => {
    localStorage.clear();
  });

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

  it("카카오 버튼 클릭 시 카카오 로그인을 시작한다", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "건너뛰기" }));

    const kakaoBtn = screen.getByRole("button", { name: /카카오로 시작하기/ });
    expect(kakaoBtn).toBeInTheDocument();

    await user.click(kakaoBtn);
    expect(signInWithKakao).toHaveBeenCalledOnce();
  });

  it("이전에 구글로 로그인한 이력이 있으면 구글 버튼에 배지를 보여준다", async () => {
    localStorage.setItem(LAST_PROVIDER_KEY, "google");
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "건너뛰기" }));

    const googleBtn = screen.getByRole("button", { name: /Google로 시작하기/ });
    const kakaoBtn = screen.getByRole("button", { name: /카카오로 시작하기/ });

    expect(within(googleBtn).getByText("마지막으로 사용함")).toBeInTheDocument();
    expect(within(kakaoBtn).queryByText("마지막으로 사용함")).not.toBeInTheDocument();
  });

  it("구글 로그인 클릭 시 마지막 로그인 수단을 localStorage에 저장한다", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "건너뛰기" }));
    await user.click(screen.getByRole("button", { name: /Google로 시작하기/ }));

    expect(localStorage.getItem(LAST_PROVIDER_KEY)).toBe("google");
  });
});
