# Re:Verse Frontend · 기술 문서

> 성경 필사 습관 트래커 **Re:Verse**의 웹 클라이언트(SPA). GitHub 잔디밭 형태의 해빗 트래킹을
> 메인으로 하는 대시보드 UI. 백엔드(`reverse_backend`, NestJS)와 한 쌍을 이룬다.
> 배포 기조: 백엔드와 **동일 오리진**(VM nginx가 정적 자산 서빙, `/api/**`만 NestJS 프록시).

> ⚠️ **현황(2026-07-19)**: **인증(구글 OAuth)은 연동 완료** — Supabase 클라이언트·세션 관리·라우트
> 가드가 실제로 동작한다. 다만 **도메인 데이터(진척률·오늘의 말씀·통계·필사 기록)는 아직 `src/data/dummy.ts`
> 더미**이며 백엔드 API(`/api/**`) 호출은 아직 없다. 즉 "로그인은 진짜, 대시보드 데이터는 더미" 단계.

---

## 🎯 개요

React 18 SPA. 로그인(구글 OAuth) → 홈 대시보드(오늘의 말씀·진척률·streak·잔디밭·최근 기록) →
필사/추천/마이페이지로 이동하는 구조. 화면과 인증은 완성됐고, 각 화면이 소비할 도메인 데이터 형태가
`dummy.ts`에 타입과 함께 정의돼 있어 백엔드 API 응답으로 교체하기 쉽게 seam이 잡혀 있다.

**요약 스펙**: Vite 6 + React 18 + TypeScript 5.7 · Tailwind CSS v4(`@theme` 토큰) · react-router 7 ·
`@supabase/supabase-js`(인증) · Pretendard(CDN) · 배포는 VM nginx(프로덕션) / Cloudflare Pages(대안)

---

## 🔧 기술 상세정보

### 스택

| 항목 | 값 |
| --- | --- |
| 빌드 | Vite 6 (`tsc -b && vite build` → `dist/`) |
| 프레임워크 | React 18.3 + TypeScript 5.7 |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` 디자인 토큰) + 페이지별 `.css` |
| 라우팅 | react-router-dom 7 (`BrowserRouter`, 중첩 라우트 + 가드) |
| 인증 | `@supabase/supabase-js` (Supabase Auth, 구글 OAuth, anon 키) |
| 폰트 | Pretendard (jsDelivr CDN) |
| 배포 | VM nginx 정적 서빙(동일 오리진) · Cloudflare Pages(`wrangler`, 대안 경로) |

### 디렉터리 구조

```
src/
  main.tsx              # 엔트리: <AuthProvider>로 App 감싼 뒤 createRoot
  App.tsx               # BrowserRouter + Routes (공개/보호 라우트 분리)
  auth/
    AuthContext.tsx     # 세션/유저/accessToken 상태 + signInWithGoogle/signOut
    ProtectedRoute.tsx  # 로그인 가드 (미로그인 → /login)
  lib/supabase.ts       # Supabase 클라이언트(anon 키, OAuth 세션 처리)
  layouts/MainLayout.tsx# 보호 화면 공통 레이아웃
  pages/
    Login/              # 로그인 (구글 OAuth 시작)
    Auth/CallbackPage   # OAuth 콜백 수신
    MainPage/           # 홈 대시보드 (오늘의 말씀·진척·streak·잔디·최근기록)
    Pilsa/              # 필사 화면
    Recommend/          # 감정 기반 추천 (mockup)
    Profile/            # 마이페이지
    Heatmap/            # 잔디밭 상세
  components/
    Header, TodayVerse, ProgressCard, StreakCard, RecentRecords, ContributionGraph
  data/dummy.ts         # 도메인 더미 데이터 + 잔디밭 카운트 생성기(결정적)
  styles/index.css      # Tailwind + @theme 토큰 + Pretendard
docs/
  TECH_DOC.md           # (이 문서)
  superpowers/specs/    # 화면 설계 문서(2026-06-24 home-dashboard-design)
```

### 인증 (구글 OAuth — 연동 완료)

Supabase Auth로 구글 OAuth를 처리한다. 백엔드는 리소스 서버라 프론트가 토큰 획득을 전담(백엔드 아키텍처 방침과 일치).

- **`lib/supabase.ts`** — anon(공개) 키로 클라이언트 생성. `detectSessionInUrl`(콜백 URL 토큰 자동 파싱),
  `autoRefreshToken`, `persistSession`(localStorage) 활성. service_role 키는 절대 사용하지 않는다.
- **`auth/AuthContext.tsx`** — 앱 시작 시 `getSession()`으로 세션 복원 + `onAuthStateChange` 구독으로
  로그인/로그아웃/토큰갱신/콜백을 실시간 반영. `signInWithGoogle()`은 `redirectTo=/auth/callback`으로
  OAuth 시작. 노출 값: `session`/`user`/**`accessToken`**(백엔드 호출용)/`isLoading`.
- **`auth/ProtectedRoute.tsx`** — `isLoading` 동안 판단 보류, 미로그인이면 `/login`으로 리다이렉트.
- **`main.tsx`** — `<AuthProvider>`가 앱 전체를 감싼다.

### 라우팅 (`App.tsx`)

공개 라우트와 `ProtectedRoute` 가드 하위(공통 `MainLayout`) 보호 라우트로 나뉜다.

| 경로 | 페이지 | 보호 | 상태 |
| --- | --- | --- | --- |
| `/` → `/login` | (redirect) | — | — |
| `/login` | LoginPage | 공개 | 구글 OAuth 시작 |
| `/auth/callback` | CallbackPage | 공개 | OAuth 콜백 수신 |
| `/mainpage` | MainPage (홈 대시보드) | 🔒 | UI + 더미 데이터 |
| `/pilsa` | PilsaPage (필사) | 🔒 | UI만 |
| `/heatmap` | HeatmapPage (잔디 상세) | 🔒 | UI + 더미 데이터 |
| `/profile` | ProfilePage (마이페이지) | 🔒 | UI만 |
| `/recommend` | RecommendPage | 🔒 | mockup |

### 데이터 계층 (인증=실제 / 도메인=더미)

인증은 Supabase 실세션이지만, 대시보드가 그리는 **도메인 데이터는 아직 `src/data/dummy.ts`**가 공급한다.
이 더미는 실제 API 응답으로 교체될 seam이자, 각 화면이 기대하는 데이터 형태의 명세 역할을 겸한다.

- `progress` — 전체 진척률(`written`/`total`/`ratio`). PRD 기준 28.4% / 8,832절
- `STREAK_DAYS`(47), `THIS_WEEK_COUNT`(12) — streak/주간 카운트
- `todayVerse` — 오늘의 Key Verse(`reference`, `text`)
- `recentRecords[]` — 최근 필사 기록(`id`/`reference`/`date`/썸네일 gradient)
- `heatmapActivity` / `buildContributionWeeks(today, weeks)` — 잔디밭 그리드. `pseudoRandom`(splitmix32
  계열 정수 믹서)으로 **날짜 결정적** 카운트를 만들고, 최근 `STREAK_DAYS` 구간은 기록 있음으로 강제.
  컬럼=주(일요일 시작)·행=요일, 미래 날짜는 `null`. `JandiLevel` 0~4 5단계.

> API 연동 시: `dummy.ts`의 상수/함수를 백엔드 응답으로 대체하고, `AuthContext`의 `accessToken`을
> `Authorization: Bearer`로 주입. 매핑 대상 — `progress` → `GET /users/me/progress`,
> `todayVerse` → `GET /verses/today`, streak → `GET /stats/me`, 잔디 → `GET /stats/activity`,
> 최근기록 → `GET /writing-sessions`.

### 디자인 토큰

`@theme`(Tailwind v4)로 정의. 잔디밭 5단계 색이 핵심 브랜드 요소.

| 항목 | 값 |
| --- | --- |
| 브랜드 컬러 | `#2663EC` |
| 배경 | `#FFFFFF` |
| 잔디밭 5단계 | `#F0F0F0` → `#BFDBFE` → `#93C5FD` → `#3B82F6` → `#1E40B0` |

---

## 🚀 배포 & 환경변수

두 경로가 저장소에 공존한다.

1. **프로덕션(현행)** — VM의 nginx가 `dist/` 정적 자산을 직접 서빙하고 `/api/**`만 NestJS로 프록시.
   백엔드와 **동일 오리진**이라 CORS가 원천 제거된다(`Dockerfile` + `nginx.conf`). VM은 `main`을 추종.
2. **대안** — Cloudflare Pages(`npm run deploy` = build + `wrangler pages deploy dist`,
   `wrangler.jsonc`의 `pages_build_output_dir: dist`). SPA 라우팅은 `public/_redirects`로 처리.

환경변수(`.env.example` 참고) — 클라이언트는 **anon(공개) 키만** 사용:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_BASE_URL=http://localhost:3000   # 로컬 백엔드(도메인 API 연동 시 사용)
```

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

---

## 📋 백엔드 연동 현황 & 다음 단계

- [x] Supabase 소셜 로그인(구글) 연동 — 세션 관리 + 보호 라우트 가드 (`auth/*`, `lib/supabase.ts`)
- [x] `.env`(`VITE_SUPABASE_*`, `VITE_API_BASE_URL`) 체계
- [ ] **도메인 API 클라이언트** — `accessToken`을 `Authorization: Bearer`로 주입하는 fetch 래퍼
- [ ] 홈 대시보드 배선: `progress`/`todayVerse`/streak/잔디/최근기록을 실제 API로 교체(현재 더미)
- [ ] 필사 플로우: `POST /writing-sessions/upload-url` → presigned PUT 업로드 → `/:id/complete` → 폴링
- [ ] RecommendPage 실제 구현 (백엔드 **감정 추천 API가 아직 미착수**라 백엔드 선행 필요)

### 알려진 불일치

- **절 수 분모**: 프론트 `BIBLE_TOTAL_VERSES = 31,102` vs 백엔드 시딩(개역개정) **31,088**. 진척률
  분모가 어긋난다. 어느 쪽을 정본으로 할지 정해 맞출 것(백엔드 `GET /users/me/progress`는 31,088 기준).

---

> 최신 대조: 2026-07-19 (`src/*` 코드 기준, 구글 OAuth 배선 반영). 백엔드 기술 문서는
> `reverse_backend/docs/NOTION_TECH_DOC.md` 및 노션 "기술 문서" 허브 참고.
