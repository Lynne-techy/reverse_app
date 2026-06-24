# Re:Verse — 홈 대시보드 예시 UI 설계

- 작성일: 2026-06-24
- 상태: 승인됨 (구현 진행)
- 범위: 예시(example) UI 1화면 + Cloudflare Pages 배포 연동. 백엔드/데이터 연동 없음(더미 데이터).

## 1. 목적

성경 필사 + 해빗 트래킹 앱 `Re:Verse`의 **홈 대시보드 1화면**을 React 웹으로 구현하고
Cloudflare Pages 배포까지 연결한다. 이번 단계는 디자인/배포 파이프라인 검증용 예시이므로
실제 인증·업로드·API 연동은 포함하지 않는다. 메인 요구사항은 GitHub contribution
graph(잔디밭) 형태의 해빗 트래킹 UI다.

## 2. 기술 스택

- **Vite + React 18 + TypeScript** — 정적 SPA 빌드(`dist`)를 Cloudflare Pages가 그대로 호스팅
- **Tailwind CSS v4** — `@tailwindcss/vite` 플러그인, CSS `@theme`로 디자인 토큰 등록
- **Pretendard** — jsDelivr CDN `@import`으로 로드, 기본 `font-family`

## 3. 디자인 토큰

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-brand` | `#2663EC` | 로고, 버튼, 강조 |
| 배경 | `#FFFFFF` | 페이지 배경 |
| `--color-jandi-0` | `#F0F0F0` | 잔디 레벨 0 (기록 없음) |
| `--color-jandi-1` | `#BFDBFE` | 잔디 레벨 1 |
| `--color-jandi-2` | `#93C5FD` | 잔디 레벨 2 |
| `--color-jandi-3` | `#3B82F6` | 잔디 레벨 3 |
| `--color-jandi-4` | `#1E40B0` | 잔디 레벨 4 (가장 많음) |

## 4. 컴포넌트 구조

```
src/
  components/
    Header.tsx            # Re:Verse 워드마크 + 더미 네비
    TodayVerse.tsx        # 슬로건 + 오늘의 Key Verse 인용
    ContributionGraph.tsx # 잔디밭: 최근 53주 × 7일 그리드, 5단계 컬러, 툴팁, 범례
    ProgressCard.tsx      # 전체 진척률 (31,102절 기준)
    StreakCard.tsx        # 연속 기록(streak)
    RecentRecords.tsx     # 최근 필사 사진 카드 그리드(플레이스홀더)
  data/dummy.ts           # 더미 데이터 + 잔디 일별 카운트 생성기(결정적)
  styles/index.css        # @import tailwind + @theme 토큰 + Pretendard
  App.tsx, main.tsx
```

각 컴포넌트는 더미 데이터를 props/모듈로만 받는 순수 표시용. 내부 상태/네트워크 없음.

## 5. 홈 레이아웃 (위 → 아래)

1. Header — `Re:Verse` 워드마크(`Re:` 강조), 우측 더미 네비
2. 오늘의 말씀 — "내가 적은 만큼 만나는 하나님" 슬로건 + Key Verse 인용
3. **잔디밭(메인)** — 최근 1년 contribution calendar. 월/요일 라벨, "적게→많이" 범례, hover 툴팁(날짜+필사 수)
4. 요약 카드 3개 — 진척률(28.4% / 8,832·31,102절), 연속 기록, 이번 주 필사 수
5. 최근 기록 — 필사 사진 썸네일 카드 그리드(플레이스홀더 + 본문 범위 라벨)

## 6. 잔디밭 컴포넌트 동작

- 오늘을 마지막 칸으로 두고 최근 53주(371일) 그리드를 구성한다.
- 각 날짜의 더미 카운트는 날짜 기반 결정적 해시로 생성(매 렌더 동일).
- 카운트 → 레벨(0~4) 매핑 후 `bg-jandi-{level}` 클래스로 채색.
- 컬럼=주, 행=요일(상단 월 라벨, 좌측 월/수/금 라벨), 우하단 범례.
- 각 셀에 `title`로 "YYYY-MM-DD · n회 필사" 툴팁.

## 7. Cloudflare Pages 배포 연동

- **(주) Git 연동**: GitHub push → Pages 대시보드에서 repo 연결. Build `npm run build`, Output `dist`.
- **(보조) Wrangler**: `wrangler.jsonc` + `npm run deploy`(`wrangler pages deploy dist`).
- SPA fallback: `public/_redirects`에 `/* /index.html 200`.
- README에 배포 절차 문서화.

## 8. 범위 밖 (YAGNI)

- 인증/로그인, 사진 업로드, 실제 API, 라우팅(단일 화면), i18n, 다른 11개 화면.
- 이후 단계에서 별도 spec으로 확장.
