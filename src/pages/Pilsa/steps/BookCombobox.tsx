import { useEffect, useId, useRef, useState } from "react";

import { BIBLE_BOOKS, bookName } from "../../../data/books";

interface BookComboboxProps {
  /** 현재 선택된 책 번호(1~66). */
  bookNo: number;
  /** 유효한 책을 고르면 그 번호(1~66)로 호출된다. */
  setBookNo: (n: number) => void;
}

// index+1 = bookNo. 매칭·표시에 함께 쓰도록 한 번만 만들어 둔다.
const BOOKS = BIBLE_BOOKS.map((name, index) => ({ name, bookNo: index + 1 }));

/**
 * 성경 66권 자동완성 콤보박스.
 * - 타이핑하면 아래에 문자열이 매칭되는 책만 추천으로 뜬다(부분 문자열 매칭).
 * - 목록에 있는 책만 확정된다: 추천을 고르거나, 입력이 실제 책 이름과 정확히 일치할 때만
 *   확정하고, 그 외에는 포커스가 빠질 때 마지막으로 유효했던 선택으로 되돌린다.
 * - 상위(PilsaPage)의 상태 계약은 그대로 — bookNo(숫자)만 주고받는다.
 */
export function BookCombobox({ bookNo, setBookNo }: BookComboboxProps) {
  const [query, setQuery] = useState(() => bookName(bookNo));
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  // 외부에서 bookNo가 바뀌면(예: 추천 페이지에서 넘어온 구절 프리필) 입력값을 맞춘다.
  // 타이핑 중에는 bookNo가 그대로라 이 효과가 입력을 덮어쓰지 않는다.
  useEffect(() => {
    setQuery(bookName(bookNo));
  }, [bookNo]);

  const trimmed = query.trim();
  // 입력이 비었거나 현재 선택된 책 이름 그대로면(아직 좁히기 전) 전체 목록을 보여준다.
  const showAll = trimmed === "" || trimmed === bookName(bookNo);
  const matches = showAll ? BOOKS : BOOKS.filter((b) => b.name.includes(trimmed));

  // 목록이 바뀌면 하이라이트를 맨 위로 되돌린다.
  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  // 키보드로 하이라이트를 옮길 때 보이도록 스크롤.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const selectBook = (n: number) => {
    setBookNo(n);
    setQuery(bookName(n));
    setOpen(false);
    // blur()는 호출하지 않는다 — onBlur(commitOrRevert)가 아직 반영 안 된 옛 query/bookNo
    // 클로저로 실행돼 값을 잠깐 되돌리는 경로가 생기기 때문. 목록만 닫고 포커스는 유지한다.
  };

  // 포커스가 빠질 때: 입력이 실제 책과 정확히 일치하면 확정, 아니면 마지막 유효 선택으로 복원.
  const commitOrRevert = () => {
    const exact = BOOKS.find((b) => b.name === trimmed);
    if (exact) {
      setBookNo(exact.bookNo);
      setQuery(exact.name);
    } else {
      setQuery(bookName(bookNo));
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && matches[highlight]) {
        e.preventDefault();
        selectBook(matches[highlight].bookNo);
      }
    } else if (e.key === "Escape") {
      // 목록만 닫고 입력값은 유효 선택으로 되돌린다.
      setQuery(bookName(bookNo));
      setOpen(false);
    }
  };

  return (
    <div className="relative mt-3">
      <input
        type="text"
        role="combobox"
        aria-label="성경 선택"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && matches[highlight] ? `${listId}-opt-${matches[highlight].bookNo}` : undefined
        }
        autoComplete="off"
        inputMode="text"
        placeholder="성경 이름을 입력하세요 (예: 창세기)"
        className="h-12 w-full rounded-xl border border-border-strong bg-white px-4 text-lg text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={commitOrRevert}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-xl border border-border-strong bg-white py-1 shadow-[0_10px_28px_rgba(23,50,74,0.14)]"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-2.5 text-base text-sub" aria-disabled="true">
              일치하는 성경이 없어요
            </li>
          ) : (
            matches.map((b, index) => {
              const isSelected = b.bookNo === bookNo;
              const isHighlighted = index === highlight;
              return (
                <li
                  key={b.bookNo}
                  id={`${listId}-opt-${b.bookNo}`}
                  role="option"
                  aria-selected={isSelected}
                  // mousedown에서 입력 blur를 막아 onClick 선택이 먼저 처리되게 한다.
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => selectBook(b.bookNo)}
                  className={`cursor-pointer px-4 py-2.5 text-lg transition ${
                    isHighlighted ? "bg-primary-soft" : ""
                  } ${isSelected ? "font-bold text-brand" : "text-ink"}`}
                >
                  {b.name}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
