import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * 렌더 단계 예외를 잡아 흰 화면(전체 크래시) 대신 폴백 UI를 보여준다.
 * 폴백은 CSS 번들 로드 실패 상황에서도 동작하도록 인라인 스타일을 쓴다.
 * (Sentry 연동 시 componentDidCatch에서 report — 별도 일감)
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          color: "#17324a",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            일시적인 오류가 발생했어요
          </h1>
          <p style={{ color: "#5b6b7a", fontSize: 14, margin: "0 0 20px" }}>
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              border: 0,
              borderRadius: 12,
              background: "#2663ec",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px 22px",
              cursor: "pointer",
            }}
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
