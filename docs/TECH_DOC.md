# Re:Verse Frontend · 기술 문서

> 성경 필사 습관 트래커 **Re:Verse**의 웹 클라이언트(SPA). GitHub 잔디밭 형태의 해빗 트래킹을
> 메인으로 하는 대시보드 UI. 백엔드(`reverse_backend`, NestJS)와 한 쌍을 이룬다.
> 배포 기조: 백엔드와 **동일 오리진**(VM nginx가 정적 자산 서빙, `/api/**`만 NestJS 프록시).

> ⚠️ **현황(2026-07-19)**: UI는 구현됐으나 **아직 API 미연동** 단계다. 인증·업로드·조회가 전부
> `src/data/dummy.ts`의 더미 데이터로 동작한다. 백엔드 API는 이미 라이브라 배선만 남았다.

---

## 🎯 개요

React 18 SPA. 로그인 → 홈 대시보드(오늘의 말씀·진척률·streak·잔디밭·최근 기록) → 필사/추천/마이페이지로
이동하는 구조. 화면은 완성돼 있고, 각 화면이 소비할 데이터 형태가 `dummy.ts`에 타입과 함께 정의돼 있어
백엔드 API 응답으로 교체하기 쉽게 seam이 잡혀 있다.

**요약 스펙**: Vite 6 + React 18 + TypeScript 5.7 · Tailwind CSS v4(`@theme` 토큰) · react-router 7 ·
Pretendard(CDN) · 배포는 VM nginx(프로덕션) / Cloudflare Pages(대안)

---

## 🔧 기술 상세정보

### 스택

| 항목 | 값 |
| --- | --- |
| 빌드 | Vite 6 (`tsc -b && vite build` → `dist/`) |
| 프레임워크 | React 18.3 + TypeScript 5.7 |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` 디자인 토큰) + 페이지별 `.css` |
| 라우팅 | react-router-dom 7 (`BrowserRouter`) |
| 폰트 | Pretendard (jsDelivr CDN) |
| 배포 | VM nginx 정적 서빙(동일 오리진) · Cloudflare Pages(`wrangler`, 대안 경로) |

### 디렉터리 구조

```
src/
  main.tsx              # 엔트리 (createRoot + StrictMode)
  App.tsx               # BrowserRouter + Routes 정의
  pages/
    Login/              # 로그인 (소셜 로그인 진입)
    MainPage/           # 홈 대시보드 (오늘의 말씀·진척·streak·잔디·최근기록)
    Pilsa/              # 필사 화면
    Recommend/          # 감정 기반 추천 (현재 최소 stub)
    Profile/            # 마이페이지
    Heatmap/            # 잔디밭 상세
  components/
    Header, TodayVerse, ProgressCard, StreakCard, RecentRecords, ContributionGraph
  data/dummy.ts         # 더미 데이터 + 잔디밭 카운트 생성기(결정적)
  styles/index.css      # Tailwind + @theme 토큰 + Pretendard
docs/
  TECH_DOC.md           # (이 문서)
  superpowers/specs/    # 화면 설계 문서(2026-06-24 home-dashboard-design)
```

### 라우팅 (`App.tsx`)

`BrowserRouter` 하나에 flat route 6개. `/`는 `/login`으로 리다이렉트. **가드/인증 래퍼는 아직 없음**
(로그인 없이 모든 경로 접근 가능 — API 연동 시 보호 라우트 도입 필요).

| 경로 | 페이지 | 상태 |
| --- | --- | --- |
| `/` → `/login` | (redirect) | — |
| `/login` | LoginPage | UI만 |
| `/mainpage` | MainPage (홈 대시보드) | UI만 (더미) |
| `/pilsa` | PilsaPage (필사) | UI만 |
| `/heatmap` | HeatmapPage (잔디 상세) | UI만 (더미) |
| `/profile` | ProfilePage (마이페이지) | UI만 |
| `/recommend` | RecommendPage | **최소 stub** (빌드용 default export만) |

### 데이터 계층 (현재: 더미)

`src/data/dummy.ts`가 모든 화면 데이터를 공급한다. 실제 API 응답으로 교체될 seam이자, 각 화면이 기대하는
데이터 형태의 명세 역할을 겸한다.

- `progress` — 전체 진척률(`written`/`total`/`ratio`). PRD 기준 28.4% / 8,832절
- `STREAK_DAYS`(47), `THIS_WEEK_COUNT`(12) — streak/주간 카운트
- `todayVerse` — 오늘의 Key Verse(`reference`, `text`)
- `recentRecords[]` — 최근 필사 기록(`id`/`reference`/`date`/썸네일 gradient)
- `buildContributionWeeks(today, weeks)` — 잔디밭 그리드 생성기. `pseudoRandom`(splitmix32 계열 정수
  믹서)으로 **날짜 결정적** 카운트를 만들고, 최근 `STREAK_DAYS` 구간은 기록 있음으로 강제. 컬럼=주(일요일
  시작)·행=요일, 미래 날짜는 `null`. `JandiLevel` 0~4 5단계.

> API 연동 시: `dummy.ts`의 상수/함수를 백엔드 응답으로 대체. 매핑 대상 —
> `progress` → `GET /users/me/progress`, `todayVerse` → `GET /verses/today`,
> streak → `GET /stats/me`, 잔디 → `GET /stats/activity`, 최근기록 → `GET /writing-sessions`.

### 디자인 토큰

`@theme`(Tailwind v4)로 정의. 잔디밭 5단계 색이 핵심 브랜드 요소.

| 항목 | 값 |
| --- | --- |
| 브랜드 컬러 | `#2663EC` |
| 배경 | `#FFFFFF` |
| 잔디밭 5단계 | `#F0F0F0` → `#BFDBFE` → `#93C5FD` → `#3B82F6` → `#1E40B0` |

---

## 🚀 배포

두 경로가 저장소에 공존한다.

1. **프로덕션(현행)** — VM의 nginx가 `dist/` 정적 자산을 직접 서빙하고 `/api/**`만 NestJS로 프록시.
   백엔드와 **동일 오리진**이라 CORS가 원천 제거된다(`Dockerfile` + `nginx.conf`). VM은 `main`을 추종.
2. **대안** — Cloudflare Pages(`npm run deploy` = build + `wrangler pages deploy dist`,
   `wrangler.jsonc`의 `pages_build_output_dir: dist`). SPA 라우팅은 `public/_redirects`로 처리.

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

---

## 📋 백엔드 연동 현황 & 다음 단계

**연동 0%** — `fetch`/axios/`import.meta.env` 사용처가 아직 없다. 백엔드 API는 라이브(`https://reverse-growthlog.com/api`).

- [ ] API 클라이언트 도입(fetch 래퍼 + `Authorization: Bearer` 주입) + `.env`(`VITE_API_BASE`)
- [ ] Supabase 소셜 로그인(구글) 연동 → 토큰 획득 → 보호 라우트 가드
- [ ] 홈 대시보드 배선: `progress`/`todayVerse`/streak/잔디/최근기록을 실제 API로 교체
- [ ] 필사 플로우: `POST /writing-sessions/upload-url` → presigned PUT 업로드 → `/:id/complete` → 폴링
- [ ] RecommendPage 실제 구현 (백엔드 **감정 추천 API가 아직 미착수**라 백엔드 선행 필요)

### 알려진 불일치

- **절 수 분모**: 프론트 `BIBLE_TOTAL_VERSES = 31,102` vs 백엔드 시딩(개역개정) **31,088**. 진척률
  분모가 어긋난다. 어느 쪽을 정본으로 할지 정해 맞출 것(백엔드 `GET /users/me/progress`는 31,088 기준).

---

> 최신 대조: 2026-07-19 (`src/*` 코드 기준). 백엔드 기술 문서는 `reverse_backend/docs/NOTION_TECH_DOC.md`
> 및 노션 "기술 문서" 허브 참고.
