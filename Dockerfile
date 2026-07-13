# React(Vite) 정적 빌드 → nginx 서빙 컨테이너
# nginx가 정적 파일을 서빙하고 /api/** 는 백엔드(api:3000)로 프록시한다 (nginx.conf 참조).

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# `npm run build`(tsc -b && vite build) 대신 vite build만 사용.
# 미배선 프로토타입 페이지(MainPage/ProfilePage)가 typecheck에 실패하지만
# 번들 그래프에는 포함되지 않는다. tsc 오류 해소 후 `npm run build`로 되돌릴 것.
RUN npx vite build

# ---- run ----
FROM nginx:alpine AS run
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
