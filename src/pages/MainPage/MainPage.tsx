import { useQueries } from "@tanstack/react-query";

import TodayVerse from "../../components/TodayVerse";
import ProgressCard from "../../components/ProgressCard";
import StreakCard from "../../components/StreakCard";
import ContributionGraph from "../../components/ContributionGraph";
import RecentRecords from "../../components/RecentRecords";
import Skeleton from "../../components/Skeleton";

import { getMyProfile, getUserProgress } from "../../api/users";
import { getTodayVerse } from "../../api/verses";
import { getActivity, getMyStatistics } from "../../api/stats";
import { getRecentWritingRecords } from "../../api/writingSessions";

import "./MainPage.css";

/**
 * Date를 사용자 로컬 날짜 기준 YYYY-MM-DD로 변환.
 * toISOString()은 UTC라 한국 시간과 날짜가 달라질 수 있어 로컬로 조합한다.
 */
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
  return { from: formatLocalDate(startDate), to: formatLocalDate(today) };
}

function MainPage() {
  const today = formatLocalDate(new Date());
  const { from, to } = getActivityDateRange();

  // 서로 독립적인 6개 데이터 → React Query로 병렬 요청 + 캐싱.
  // 하나가 실패해도 나머지는 각자 렌더된다(위젯별 로딩/에러 = 점진 노출).
  const [profileQ, verseQ, progressQ, statsQ, activityQ, recordsQ] = useQueries({
    queries: [
      { queryKey: ["profile"], queryFn: getMyProfile },
      { queryKey: ["todayVerse", today], queryFn: () => getTodayVerse(today) },
      { queryKey: ["progress"], queryFn: getUserProgress },
      { queryKey: ["statistics"], queryFn: getMyStatistics },
      { queryKey: ["activity", from, to], queryFn: () => getActivity(from, to) },
      { queryKey: ["recentRecords"], queryFn: getRecentWritingRecords },
    ],
  });

  const userName = profileQ.data?.displayName || "사용자";

  // 일부 실패 안내(모아서 한 줄로).
  const failed = [
    profileQ.isError && "사용자 정보",
    verseQ.isError && "오늘의 말씀",
    progressQ.isError && "필사 진척률",
    statsQ.isError && "필사 통계",
    activityQ.isError && "활동 기록",
    recordsQ.isError && "최근 필사 기록",
  ].filter(Boolean) as string[];
  const errorMessage = failed.length ? `${failed.join(", ")} 데이터를 불러오지 못했습니다.` : "";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* 인사 영역 */}
      <section className="flex items-center justify-between rounded-2xl bg-blue-50 px-7 py-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {profileQ.isPending ? (
              <Skeleton width={240} height={30} radius={8} />
            ) : (
              `안녕하세요, ${userName}님 👋`
            )}
          </h1>
          <p className="mt-2 text-lg text-slate-600">오늘도 한 글자씩, 만나러 가볼까요.</p>
        </div>

        <button
          type="button"
          className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700"
        >
          ✎ 오늘 필사 시작
        </button>
      </section>

      {/* 일부 API 실패 안내 */}
      {errorMessage && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* 오늘의 말씀 */}
      <div className="mt-6">
        <TodayVerse verse={verseQ.data ?? null} isLoading={verseQ.isPending} />
      </div>

      {/* 진척률 및 스트릭 */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProgressCard progress={progressQ.data ?? null} isLoading={progressQ.isPending} />
        <StreakCard statistics={statsQ.data ?? null} isLoading={statsQ.isPending} />
      </div>

      {/* 필사 활동 잔디 */}
      <div className="mt-4">
        <ContributionGraph activity={activityQ.data ?? []} isLoading={activityQ.isPending} />
      </div>

      {/* 최근 필사 기록 */}
      <div className="mt-4">
        <RecentRecords records={recordsQ.data ?? []} isLoading={recordsQ.isPending} />
      </div>
    </main>
  );
}

export default MainPage;
