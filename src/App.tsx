import Header from "./components/Header";
import TodayVerse from "./components/TodayVerse";
import ContributionGraph from "./components/ContributionGraph";
import ProgressCard from "./components/ProgressCard";
import StreakCard from "./components/StreakCard";
import RecentRecords from "./components/RecentRecords";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-8 sm:py-10">
        <TodayVerse />

        <ContributionGraph />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProgressCard />
          <StreakCard />
        </div>

        <RecentRecords />
      </main>

      <footer className="mx-auto max-w-5xl px-5 py-10 text-center text-xs text-gray-400">
        Re:Verse · 내가 적은 만큼 만나는 하나님 · 예시 UI
      </footer>
    </div>
  );
}
