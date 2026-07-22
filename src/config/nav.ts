/**
 * 로그인 이후 주 내비게이션 항목 (단일 출처).
 * 데스크탑 Sidebar(md:flex)와 모바일 하단 탭바(md:hidden)가 이 배열을 공유한다.
 * 실제 App.tsx 라우트와 일치해야 한다.
 */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "홈", path: "/mainpage", icon: "⌂" },
  { label: "필사", path: "/pilsa", icon: "✎" },
  { label: "히트맵", path: "/heatmap", icon: "▦" },
  { label: "추천", path: "/recommend", icon: "♡" },
  { label: "프로필", path: "/profile", icon: "○" },
];
