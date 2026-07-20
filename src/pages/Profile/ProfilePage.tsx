import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyProfile,
getUserProgress,
} from "../../api/users";
import { getMyStatistics } from "../../api/stats";

import type { UserProgress } from "../../api/users";
import type { MyStatistics } from "../../api/stats";

import { supabase } from "../../lib/supabase";

import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("사용자");

  const [userEmail, setUserEmail] = useState("");

  const [progress, setProgress] = useState<UserProgress | null>(null);

  const [statistics, setStatistics] = useState<MyStatistics | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [
          profileData,
          progressData,
          statisticsData,
          sessionResult,
        ] = await Promise.all([
          getMyProfile(),
          getUserProgress(),
          getMyStatistics(),
          supabase.auth.getSession(),
        ]);

        if (sessionResult.error) {
          throw sessionResult.error;
        }

        if (!isMounted) {
          return;
        }

        const sessionUser =
          sessionResult.data.session?.user;

        const metadata =
          sessionUser?.user_metadata ?? {};

        const name =
          profileData.displayName ||
          metadata.full_name ||
          metadata.name ||
          "사용자";

        setUserName(name);
        setUserEmail(sessionUser?.email ?? "");
        setProgress(progressData);
        setStatistics(statisticsData);
      } catch (error) { 
        console.error( "프로필 데이터 조회 실패:", error, ); 
        if (!isMounted) { return; } 
        setErrorMessage( error instanceof Error ? error.message : "프로필 정보를 불러오지 못했습니다.", ); 
      } finally { 
        if (isMounted) { setIsLoading(false); } 
      } 
    };

    void loadProfileData();

    return () => { isMounted = false;};

  }, []);

  const handleLogout = async () => {
    const { error } =
    await supabase.auth.signOut();

    if (error) {
      console.error("로그아웃 실패:", error);

      setErrorMessage(
        "로그아웃하지 못했습니다. 다시 시도해주세요.",
      );

      return;
    }

    navigate("/login", { replace: true, });
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <section>
          <p className="m-0 text-sm font-semibold text-brand">
            마이페이지
          </p>

          <h1 className="mb-0 mt-2 text-3xl font-bold text-slate-900">
            프로필
          </h1>

          <p className="mb-0 mt-3 text-sm text-slate-500">
            나의 필사 기록과 계정 정보를 확인해보세요.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="m-0 text-sm text-slate-500">
            프로필 정보를 불러오는 중...
          </p>
        </section>
      </main>
    );
  }

  if (!progress || !statistics) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <section>
          <p className="m-0 text-sm font-semibold text-brand">
            마이페이지
          </p>

          <h1 className="mb-0 mt-2 text-3xl font-bold text-slate-900">
            프로필
          </h1>

          <p className="mb-0 mt-3 text-sm text-slate-500">
            나의 필사 기록과 계정 정보를 확인해보세요.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p>
            {errorMessage ||
              "프로필 정보를 불러오지 못했습니다."}
          </p>
        </section>
      </main>
    );
  }

  const progressRate = Math.min(Math.max(progress.progressRate, 0), 100,);

  const profileInitial = userName.trim().slice(0, 1) || "사";

  const achievements = [
    {
      emoji: "🔥",
      title: `${statistics.currentStreak}일 연속 필사`,
      description: `최장 연속 기록은 ${statistics.longestStreak}일이에요.`,
    },
    {
      emoji: "✍️",
      title: `${progress.coveredVerses.toLocaleString()}절 필사`,
      description: `지금까지 총 ${statistics.totalCount.toLocaleString()}번 필사했어요.`,
      },
    {
      emoji: "📖",
      title: `${progress.completedBooks}권 완필`,
      description: `전체 성경의 ${progressRate.toFixed(1)}%를 기록했어요.`,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* 페이지 제목 */}
      <section>
        <p className="m-0 text-sm font-semibold text-brand">
          마이페이지
        </p>

        <h1 className="mb-0 mt-2 text-3xl font-bold text-slate-900">
          프로필
        </h1>

        <p className="mb-0 mt-3 text-sm text-slate-500">
          나의 필사 기록과 계정 정보를 확인해보세요.
        </p>
      </section>

      {/* 프로필 카드 */}
      <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-blue-500 to-accent p-6 text-white shadow-sm md:p-8">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white/20 text-2xl font-bold ring-1 ring-white/30">
            {profileInitial}
          </div>

          <div className="min-w-0">
            <h2 className="m-0 text-2xl font-bold">{userName}님</h2>

            <p className="mb-0 mt-2 truncate text-sm text-white/90">
              {userEmail || "이메일 정보 없음"}
            </p>

            <p className="mb-0 mt-2 text-xs text-white/75">
              {progress.completedBooks}권 완필 ·{" "}
              {statistics.currentStreak}일 연속
            </p>
          </div>
        </div>
      </section>

      {/* 요약 통계 */}
      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <strong className="block text-2xl text-slate-900">
            {statistics.totalCount.toLocaleString()}
          </strong>

          <small className="mt-2 block text-sm text-slate-500">필사 기록</small>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <strong className="block text-2xl text-slate-900">
            {progressRate.toFixed(1)}%
          </strong>

          <small className="mt-2 block text-sm text-slate-500">진척률</small>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <strong className="block text-2xl text-slate-900">
            {progress.completedBooks}
          </strong>

          <small className="mt-2 block text-sm text-slate-500">완료한 성경</small>
        </article>
      </section>

      {/* 전체 필사 진척률 */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <span className="text-sm font-medium text-slate-500">
          전체 성경 필사 진척률
        </span>

        <strong className="mt-2 block text-3xl text-slate-900">
          {progressRate.toFixed(1)}
          <small>%</small>
        </strong>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
            style={{
              width: `${progressRate}%`,
            }}
          />
        </div>

        <small>
          {progress.coveredVerses.toLocaleString()} /{" "}
          {progress.totalVerses.toLocaleString()}절
        </small>
      </section>

      {/* 실제 데이터 기반 기록 뱃지 */}
      <section className="mt-8">
        <h2 className="m-0 text-xl font-bold text-slate-900">
          나의 기록 뱃지
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {achievements.map((achievement) => (
            <article
              key={achievement.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl"
                aria-hidden="true"
              >
                {achievement.emoji}
              </span>

              <h3 className="mb-0 mt-4 text-base font-bold text-slate-900">
                {achievement.title}
              </h3>

              <p className="mb-0 mt-2 text-sm leading-6 text-slate-500">
                {achievement.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {errorMessage && (
        <p role="alert" className="mb-0 mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {/* 로그아웃 */}
      <section className="mt-8 flex justify-end">
        <button type="button" className="border-0 bg-transparent p-0 text-sm font-semibold text-slate-400 transition hover:text-red-500" onClick={handleLogout}>
          로그아웃
        </button>
      </section>
    </main>

  );
}
export default ProfilePage;