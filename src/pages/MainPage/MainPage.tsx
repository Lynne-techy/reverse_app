import Header from "../../components/Header";
import TodayVerse from "../../components/TodayVerse";
import ProgressCard from "../../components/ProgressCard";
import StreakCard from "../../components/StreakCard";
import ContributionGraph from "../../components/ContributionGraph";
import RecentRecords from "../../components/RecentRecords";

import "./MainPage.css";

function MainPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <Header />

      <div className="mt-6">
        <TodayVerse />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProgressCard />
        <StreakCard />
      </div>

      <div className="mt-4">
        <ContributionGraph />
      </div>

      <div className="mt-4">
        <RecentRecords />
      </div>
    </main>
  );
}

export default MainPage;