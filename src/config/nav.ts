/**
 * 로그인 이후 주 내비게이션 항목 (단일 출처).
 * 데스크탑 Sidebar(md:flex)와 모바일 하단 탭바(md:hidden)가 이 배열을 공유한다.
 * 실제 App.tsx 라우트와 일치해야 한다.
 */

import { Home, NotebookPen, LayoutGrid, Sparkles, CircleUserRound, LucideIcon } from "lucide-react";
export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "홈", path: "/mainpage", icon: Home },
  { label: "필사", path: "/pilsa", icon: NotebookPen },
  { label: "히트맵", path: "/heatmap", icon: LayoutGrid },
  { label: "추천", path: "/recommend", icon: Sparkles },
  { label: "프로필", path: "/profile", icon: CircleUserRound },
];
