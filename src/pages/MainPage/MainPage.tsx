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
