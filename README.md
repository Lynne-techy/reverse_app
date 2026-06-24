# Re:Verse

> 내가 적은 만큼 만나는 하나님.

성경 필사 + 해빗 트래킹 웹 앱 **Re:Verse**의 예시 UI입니다.
GitHub contribution graph(잔디밭) 형태의 해빗 트래킹을 메인으로 하는 홈 대시보드 1화면을
React로 구현하고 Cloudflare Pages로 배포합니다.

> ⚠️ 현재는 **예시 단계**입니다. 인증·사진 업로드·API 연동 없이 더미 데이터로 UI만 보여줍니다.

## 기술 스택

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`, `@theme` 디자인 토큰)
- **Pretendard** (jsDelivr CDN)
- 배포: **Cloudflare Pages**

## 디자인 토큰

| 항목 | 값 |
| --- | --- |
| 브랜드 컬러 | `#2663EC` |
| 배경 | `#FFFFFF` |
| 잔디밭 5단계 | `#F0F0F0` → `#BFDBFE` → `#93C5FD` → `#3B82F6` → `#1E40B0` |

## 개발

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

## Cloudflare Pages 배포

### 방법 1 — Git 연동 (권장)

GitHub 저장소를 push한 뒤 Cloudflare Pages 대시보드에서 연결합니다.

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 이 저장소 선택
3. 빌드 설정
   - **Framework preset**: `Vite` (또는 None)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Save and Deploy** → 이후 `main` push마다 자동 배포

SPA 라우팅은 `public/_redirects`(`/* /index.html 200`)로 처리됩니다.

### 방법 2 — Wrangler CLI (로컬에서 직접 배포)

```bash
npx wrangler login        # 최초 1회
npm run deploy            # = npm run build && wrangler pages deploy dist
```

프로젝트 설정은 `wrangler.jsonc`(`pages_build_output_dir: dist`)에 있습니다.

## 디렉터리 구조

```
src/
  components/   # Header, TodayVerse, ContributionGraph(잔디밭), ProgressCard, StreakCard, RecentRecords
  data/dummy.ts # 더미 데이터 + 잔디밭 카운트 생성기(결정적)
  styles/       # Tailwind + @theme 토큰 + Pretendard
docs/superpowers/specs/  # 설계 문서
```
