import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import CompletedCard from "../../components/CompletedCard";
import ContributionGraph from "../../components/ContributionGraph";
import ProgressCard from "../../components/ProgressCard";
import RecentRecords from "../../components/RecentRecords";
import Skeleton from "../../components/Skeleton";
import StreakCard from "../../components/StreakCard";
import TodayVerse from "../../components/TodayVerse";

import { getActivity, getMyStatistics } from "../../api/stats";
import { getMyProfile, getUserProgress } from "../../api/users";
import { getTodayVerse } from "../../api/verses";
import {
  getRecentMeditationCount,
  getRecentWritingRecords,
} from "../../api/writingSessions";

import "./MainPage.css";

/** Date를 사용자 로컬 날짜 기준 YYYY-MM-DD로 변환한다. */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** 잔디 그래프에 쓸 최근 1년 날짜 범위. */
function getActivityDateRange() {
  const today = new Date();
  const startDate = new Date(today);

  startDate.setDate(today.getDate() - 364);

  return {
    from: formatLocalDate(startDate),
    to: formatLocalDate(today),
  };
}

/* ─────────────────────────────────────
   신규 가입 축하 폭죽 (Fireworks)
───────────────────────────────────── */

const FIREWORK_COLORS = ["#ffd93d", "#ff6b6b", "#6bc7ef", "#8d69cc", "#61b7aa"];

const FIREWORK_AUTO_HIDE_MS = 4000;

interface FireworkParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface FireworkBurst {
  id: number;
  top: string;
  left: string;
  delay: string;
  particles: FireworkParticle[];
}

/** 폭죽 한 다발(burst)의 파티클(불꽃 조각)들을 방사형으로 배치한다. */
function createParticles(count: number): FireworkParticle[] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * 2 * Math.PI;
    const distance = 70 + Math.random() * 40;

    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
    };
  });
}

/** 화면 여러 지점에서 순차적으로 터지는 폭죽 다발들. 모듈 로드 시 1회만 계산된다. */
const FIREWORK_BURSTS: FireworkBurst[] = [
  { id: 0, top: "28%", left: "22%", delay: "0s" },
  { id: 1, top: "18%", left: "72%", delay: "0.25s" },
  { id: 2, top: "55%", left: "50%", delay: "0.5s" },
  { id: 3, top: "65%", left: "20%", delay: "0.75s" },
  { id: 4, top: "38%", left: "82%", delay: "1s" },
].map((burst) => ({ ...burst, particles: createParticles(12) }));

/** 신규 가입 축하 폭죽 오버레이. 전체 화면을 덮으며 클릭을 막지 않는다. */
function Fireworks() {
  return (
    <div className="welcome-fireworks" aria-hidden="true">
      {FIREWORK_BURSTS.map((burst) => (
        <div
          key={burst.id}
          className="firework-burst"
          style={{ top: burst.top, left: burst.left }}
        >
          {burst.particles.map((particle) => (
            <span
              key={particle.id}
              className="firework-particle"
              style={
                {
                  "--x": `${particle.x}px`,
                  "--y": `${particle.y}px`,
                  animationDelay: burst.delay,
                  background: particle.color,
                  color: particle.color,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MainPage() {
  const navigate = useNavigate();
  const today = formatLocalDate(new Date());
  const { from, to } = getActivityDateRange();

  const [
    profileQ,
    verseQ,
    progressQ,
    statsQ,
    activityQ,
    recordsQ,
    meditationCountQ,
  ] = useQueries({
    queries: [
      { queryKey: ["profile"], queryFn: getMyProfile },
      { queryKey: ["todayVerse", today], queryFn: () => getTodayVerse(today) },
      { queryKey: ["progress"], queryFn: getUserProgress },
      { queryKey: ["statistics"], queryFn: getMyStatistics },
      { queryKey: ["activity", from, to], queryFn: () => getActivity(from, to) },
      { queryKey: ["recentRecords"], queryFn: getRecentWritingRecords },
      {
        queryKey: ["recentMeditationCount", 30],
        queryFn: () => getRecentMeditationCount(30),
      },
    ],
  });

  const userName = profileQ.data?.displayName || "사용자";

  // undefined(로딩 중)와 false(기존 사용자)를 모두 "폭죽 없음"으로 취급한다.
  // === true 로 명시해야 데이터가 오기 전에 잘못된 분기로 새지 않는다.
  const isNewUser = profileQ.data?.isNewUser === true;

  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (!isNewUser) return;

    setShowFireworks(true);

    const timer = setTimeout(() => {
      setShowFireworks(false);
    }, FIREWORK_AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [isNewUser]);

  const failed = [
    profileQ.isError && "사용자 정보",
    verseQ.isError && "오늘의 말씀",
    progressQ.isError && "필사 진척률",
    statsQ.isError && "필사 통계",
    activityQ.isError && "활동 기록",
    recordsQ.isError && "최근 필사 기록",
    meditationCountQ.isError && "최근 기록 통계",
  ].filter(Boolean) as string[];

  const errorMessage = failed.length
    ? `${failed.join(", ")} 데이터를 불러오지 못했습니다.`
    : "";

  return (
    <main className="home-page">
      {showFireworks && <Fireworks />}

      <section className="home-hero">
        <div className="home-hero__copy">
          <h1 className="home-hero__title">
            {profileQ.isPending ? (
              <Skeleton width={260} height={42} radius={10} />
            ) : (
              <>
                안녕하세요, {userName}님 <span aria-hidden="true">👋</span>
              </>
            )}
          </h1>

          <p className="home-hero__description">오늘도 한 글자씩, 만나러 가볼까요.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/pilsa")}
          className="home-primary-button"
        >
          <span aria-hidden="true">✎</span>
          오늘 필사 시작
        </button>
      </section>

      {errorMessage && (
        <div role="alert" className="home-error-message">
          {errorMessage}
        </div>
      )}

      <TodayVerse verse={verseQ.data ?? null} isLoading={verseQ.isPending} />

      <div className="home-summary-grid">
        <ProgressCard
          progress={progressQ.data ?? null}
          isLoading={progressQ.isPending}
        />

        <StreakCard
          statistics={statsQ.data ?? null}
          isLoading={statsQ.isPending}
        />

        <CompletedCard
          meditationCount={meditationCountQ.data ?? null}
          isLoading={meditationCountQ.isPending}
        />
      </div>

      <div className="home-dashboard-grid">
        <ContributionGraph
          activity={activityQ.data ?? []}
          isLoading={activityQ.isPending}
        />

        <RecentRecords
          records={recordsQ.data ?? []}
          isLoading={recordsQ.isPending}
        />
      </div>
    </main>
  );
}

export default MainPage;
