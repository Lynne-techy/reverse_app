import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../config/nav";

/**
 * 모바일 하단 고정 탭바. 데스크탑은 Sidebar(md:flex)가 담당하므로 md:hidden으로 숨긴다.
 * Sidebar와 동일한 NAV_ITEMS를 공유한다. iOS 안전영역(safe-area-inset-bottom) 대응.
 * (NavLink가 활성 항목에 aria-current="page"를 자동 부여)
 */
function MobileTabBar() {
  return (
    <nav
      aria-label="주 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        // 1. 대문자로 시작하는 Icon 변수에 아이콘 컴포넌트를 할당합니다.
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] no-underline transition",
                isActive ? "font-semibold text-blue-600" : "text-slate-500",
              ].join(" ")
            }
          >
            {/* 2. {item.icon} 대신 <Icon size={20} /> 형태로 출력합니다. */}
            <span aria-hidden="true" className="flex items-center justify-center">
              <Icon size={20} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default MobileTabBar;