import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Boom(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("정상일 때 자식을 렌더한다", () => {
    render(
      <ErrorBoundary>
        <p>정상 콘텐츠</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("정상 콘텐츠")).toBeInTheDocument();
  });

  it("자식이 throw하면 폴백 UI를 보여준다", () => {
    // 의도된 throw의 콘솔 에러를 억제.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("일시적인 오류가 발생했어요")).toBeInTheDocument();
    spy.mockRestore();
  });
});
