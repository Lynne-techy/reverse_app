import { NavLink } from "react-router-dom";

type MenuItem = {
  label: string;
  path: string;
  icon: string;
};

const menuItems: MenuItem[] = [
  {
    label: "홈",
    path: "/mainpage",
    icon: "⌂",
  },
  {
    label: "필사",
    path: "/pilsa",
    icon: "✎",
  },
  {
    label: "히트맵",
    path: "/heatmap",
    icon: "▦",
  },
  {
    label: "추천",
    path: "/recommend",
    icon: "♡",
  },
  {
    label: "프로필",
    path: "/profile",
    icon: "○",
  },
];

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-60 shrink-0 flex-col bg-sidebar px-4 py-7 text-white md:flex">
      <div className="mb-9 px-3">
        <h1 className="m-0 text-2xl font-bold">
          Re<span className="text-accent">:</span>Verse
        </h1>

        <p className="mt-1 text-xs text-white/50">내가 적은 만큼 만나는 하나님</p>
      </div>

      <nav aria-label="주 메뉴" className="flex flex-1 flex-col gap-1">
        {menuItems.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-4 py-3",
                "text-sm no-underline transition",
                isActive
                  ? "bg-white/15 font-semibold text-white"
                  : "text-white/65 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
          >
            <span aria-hidden="true" className="w-6 text-center text-lg">
              {menu.icon}
            </span>

            <span>{menu.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="rounded-xl bg-white/10 p-4 text-xs text-white/60">
        <strong className="text-white/90">Re:Verse</strong>
        <p className="mb-0 mt-1">오늘도 한 글자씩 기록해요.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
