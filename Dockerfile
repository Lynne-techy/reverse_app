# React(Vite) 정적 빌드 → nginx 서빙 컨테이너
# nginx가 정적 파일을 서빙하고 /api/** 는 백엔드(api:3000)로 프록시한다 (nginx.conf 참조).

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# tsc 오류(ContributionGraph 미배선)가 해소되어 typecheck를 배포 경로에 되살린다.
# `npm run build` = tsc -b && vite build → 타입 에러 시 배포가 실패(회귀 게이트).
RUN npm run build

# ---- run ----
FROM nginx:alpine AS run
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
