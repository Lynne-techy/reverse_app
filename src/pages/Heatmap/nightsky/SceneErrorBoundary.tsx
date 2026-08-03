// 밤하늘 씬 전용 에러 경계 — Canvas 초기화/렌더 예외를 잡아 2D 폴백으로 바꾼다.
// (앱 전역 ErrorBoundary는 전체화면 "홈으로"라 국소 폴백엔 부적합.)

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[NightSky] 3D 씬 렌더 실패 — 폴백으로 전환:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default SceneErrorBoundary;
