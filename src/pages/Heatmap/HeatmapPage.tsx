import { useQueries } from "@tanstack/react-query";

import Heatmap from "../../components/Heatmap";
import StatTile from "../../components/StatTile";
import StreakStartCard from "../../components/StreakStartCard";
import { getActivity, getMyStatistics } from "../../api/stats";

/**
 * Date를 사용자 로컬 날짜 기준 YYYY-MM-DD로 변환.
 * toISOString()은 UTC라 한국 시간과 날짜가 달라질 수 있어 로컬로 조합한다.
 * (MainPage와 동일 로직 — 추후 공용 utils로 추출 여지 있음)
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 잔디 그래프에 쓸 최근 1년 날짜 범위(from = 오늘−364). */
function getActivityDateRange() {
  const today = new Date();
  const startDate = new Date(today);

  startDate.setDate(today.getDate() - 364);

  return {
    from: formatLocalDate(startDate),
    to: formatLocalDate(today),
  };
}

function HeatmapPage() {
  const { from, to } = getActivityDateRange();

  // 통계 + 활동 잔디 병렬 요청. queryKey를 MainPage와 동일하게 두어 캐시를 공유한다.
  const [statsQ, activityQ] = useQueries({
    queries: [
      {
        queryKey: ["statistics"],
        queryFn: getMyStatistics,
      },
      {
        queryKey: ["activity", from, to],
        queryFn: () => getActivity(from, to),
      },
    ],
  });

  const statistics = statsQ.data ?? null;
  const activity = activityQ.data ?? [];

  // 일부 실패 안내(모아서 한 줄로).
  const failed = [statsQ.isError && "필사 통계", activityQ.isError && "활동 기록"].filter(
    Boolean,
  ) as string[];

  const errorMessage = failed.length ? `${failed.join(", ")} 데이터를 불러오지 못했습니다.` : "";

  return (
    <main className="w-full px-6 py-8">
      {/* 추천·프로필 페이지와 같은 3단 페이지 헤더 */}
      <section>
        <p className="app-page__eyebrow">필사 기록</p>
        <h1 className="app-page__title">나의 필사 기록</h1>
        <p className="app-page__description">최근 1년간 하루하루 채워온 기록이에요.</p>
      </section>

      {/* 일부 API 실패 안내 */}
      {errorMessage && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* 부제 아래 간격 + 스탯 카드 3종 */}
      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <StatTile
          label="현재 연속 필사"
          value={statistics ? `${statistics.currentStreak}일` : "—"}
          caption="오늘까지 이어지는 중"
        />
        <StatTile
          label="최장 연속 필사"
          value={statistics ? `${statistics.longestStreak}일` : "—"}
          caption="개인 기록"
        />
        <StatTile
          label="총 필사"
          value={statistics ? `${statistics.totalCount}회` : "—"}
          caption="누적 기록"
        />
      </div>

      {/* 잔디 — 위아래 카드와 좌우 경계를 맞추기 위해 별도 wrapper 없이 카드 자신으로 정렬 */}
      <div className="mt-4">
        <Heatmap activity={activity} startDate={from} endDate={to} title="최근 1년" />
      </div>

      {/* 가로로 꽉 채운 연속 시작 카드 */}
      <div className="mt-4">
        <StreakStartCard statistics={statistics} isLoading={statsQ.isPending} />
      </div>
    </main>
  );
}

export default HeatmapPage;
