const NAV = ["홈", "필사", "히트맵", "성경 여권", "통계"];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <a href="/" className="flex items-baseline gap-0.5 text-2xl font-extrabold tracking-tight">
          <span className="text-brand">Re:</span>
          <span className="text-gray-900">Verse</span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-gray-500 sm:flex">
          {NAV.map((item, i) => (
            <a
              key={item}
              href="#"
              className={i === 0 ? "text-gray-900" : "transition-colors hover:text-gray-900"}
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          + 필사 기록
        </button>
      </div>
    </header>
  );
}
