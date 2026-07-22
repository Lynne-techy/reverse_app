import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../config/nav";
import { supabase } from "../lib/supabase";
import sidebarStars from "../styles/stars.png";
import { LogOut } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("로그아웃 실패:", error);
      setIsLoggingOut(false);
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <aside className="premium-sidebar sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto px-6 py-8 text-white md:flex lg:w-80 2xl:w-[21rem]">
      <div className="premium-sidebar__brand mb-10 px-2">
        <h1 className="m-0 text-3xl font-bold tracking-tight">
          Re<span className="premium-sidebar__colon">:</span>Verse
        </h1>
        <p className="mt-2 text-white/70">내가 적은 만큼 만나는 하나님</p>
      </div>

      <nav aria-label="주 메뉴" className="flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map((menu) => {
          // 대문자로 시작하는 변수에 아이콘 컴포넌트를 할당
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                [
                  "premium-sidebar__link flex items-center gap-4 rounded-2xl px-5 py-4",
                  "text-[19px] font-medium no-underline transition",
                  isActive
                    ? "premium-sidebar__link--active font-semibold text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <span aria-hidden="true" className="flex items-center justify-center">
                {/* 아이콘 태그 형태로 렌더링 */}
                <Icon size={25} className="shrink-0" />
              </span>
              <span>{menu.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div
        className="premium-sidebar__ambient"
        style={{ backgroundImage: `url(${sidebarStars})` }}
        aria-hidden="true"
      />
      <div className="premium-sidebar__phrase">
        <span>오늘의 기록</span>

        <p>
          한 줄씩, 천천히
          <br />
          나만의 리듬을 쌓아가요.
        </p>
      </div>
      
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="premium-sidebar__logout"
      >
        <LogOut size={21} aria-hidden="true" />
        <span>{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</span>
      </button>
    </aside>
  );
}

export default Sidebar;
