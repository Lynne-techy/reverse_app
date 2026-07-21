import Heatmap from "../../components/Heatmap";
import StatTile from "../../components/StatTile";
import StreakStartCard from "../../components/StreakStartCard";
import { dummyStatistics, heatmapActivity } from "../../data/dummy";

function HeatmapPage() {
  // TODO(API 연동): dummyStatistics → getMyStatistics(), heatmapActivity → getActivity(from, to)
  const statistics = dummyStatistics;
  const activity = heatmapActivity;

  // "기록한 날"은 서버 필드가 아니라 activity에서 파생 — 기록이 1회 이상인 날 수.
  const recordedDays = activity.filter((count) => count > 0).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* (1)(2) 제목 · 부제 */}
      <h1 className="text-3xl font-bold text-slate-800">나의 필사 기록</h1>
      <p className="mt-2 text-slate-600">최근 1년간 하루하루 채워온 기록이에요.</p>

      {/* (3)(4) 부제 아래 간격 + 스탯 카드 3종 */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="🔥 현재 연속 필사"
          value={`${statistics.currentStreak}일`}
          caption="오늘까지 이어지는 중"
        />
        <StatTile
          label="최장 연속 필사"
          value={`${statistics.longestStreak}일`}
          caption="개인 기록"
        />
        <StatTile label="기록한 날" value={`${recordedDays}일`} caption="지난 1년" />
      </div>

      {/* (5) 잔디 — 위아래 카드와 좌우 경계를 맞추기 위해 별도 wrapper 없이 카드 자신으로 정렬 */}
      <div className="mt-4">
        <Heatmap activity={activity} title="최근 1년" />
      </div>

      {/* (6) 가로로 꽉 채운 연속 시작 카드 */}
      <div className="mt-4">
        <StreakStartCard statistics={statistics} />
      </div>
    </main>
  );
}

export default HeatmapPage;
