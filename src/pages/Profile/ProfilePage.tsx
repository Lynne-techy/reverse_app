import "./ProfilePage.css";

// function ProfilePage() {

//     // =====================
//     // State
//     // =====================



//     // =====================
//     // Event Handlers
//     // =====================

//     const handleEditProfile = () => {

//     };

//     const handleSaveProfile = () => {

//     };

//     const handleCancelEdit = () => {

//     };

//     const handleLogout = () => {

//     };


//     // =====================
//     // JSX
//     // =====================

//     return (

//         <>

//             <h1>Profile</h1>

//         </>

//     );
// }

// export default ProfilePage;
import { useState } from "react";
import { Link } from "react-router-dom";

type ProfileData = {
  name: string;
  email: string;
  joinedAt: string;
  totalVerses: number;
  streakDays: number;
  completedBooks: number;
  progressRate: number;
};

const profile: ProfileData = {
  name: "혜린",
  email: "hyelin@example.com",
  joinedAt: "2026년 3월",
  totalVerses: 8832,
  streakDays: 14,
  completedBooks: 7,
  progressRate: 28.4,
};

const recentAchievements = [
  {
    emoji: "🔥",
    title: "14일 연속 필사",
    description: "2주 동안 매일 기록했어요.",
  },
  {
    emoji: "📖",
    title: "누적 8,000절 달성",
    description: "성경의 4분의 1을 넘게 기록했어요.",
  },
  {
    emoji: "🌱",
    title: "꾸준한 기록가",
    description: "이번 달 20일 이상 필사했어요.",
  },
];

const settingItems = [
  {
    emoji: "👤",
    title: "프로필 정보",
    description: "이름과 기본 정보를 관리합니다.",
  },
  {
    emoji: "🔒",
    title: "비밀번호 변경",
    description: "계정 비밀번호를 변경합니다.",
  },
  {
    emoji: "🎨",
    title: "화면 설정",
    description: "앱 화면과 테마를 설정합니다.",
  },
];

function ProfilePage() {
  const [notificationEnabled, setNotificationEnabled] =
    useState(true);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
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

      {/* 사용자 프로필 카드 */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-blue-100 text-2xl font-bold text-brand">
              {profile.name.slice(0, 1)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="m-0 text-2xl font-bold text-slate-900">
                  {profile.name}님
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
                  꾸준한 기록가
                </span>
              </div>

              <p className="mb-0 mt-2 text-sm text-slate-500">
                {profile.email}
              </p>

              <p className="mb-0 mt-1 text-xs text-slate-400">
                {profile.joinedAt}부터 Re:Verse와
                함께하고 있어요.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-brand"
          >
            프로필 수정
          </button>
        </div>
      </section>

      {/* 통계 카드 */}
      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              누적 필사
            </span>

            <span
              aria-hidden="true"
              className="text-xl"
            >
              ✎
            </span>
          </div>

          <strong className="mt-4 block text-2xl text-slate-900">
            {profile.totalVerses.toLocaleString()}
            <span className="ml-1 text-sm font-medium text-slate-400">
              절
            </span>
          </strong>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              연속 기록
            </span>

            <span
              aria-hidden="true"
              className="text-xl"
            >
              🔥
            </span>
          </div>

          <strong className="mt-4 block text-2xl text-slate-900">
            {profile.streakDays}
            <span className="ml-1 text-sm font-medium text-slate-400">
              일
            </span>
          </strong>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              완료한 성경
            </span>

            <span
              aria-hidden="true"
              className="text-xl"
            >
              📖
            </span>
          </div>

          <strong className="mt-4 block text-2xl text-slate-900">
            {profile.completedBooks}
            <span className="ml-1 text-sm font-medium text-slate-400">
              권
            </span>
          </strong>
        </article>
      </section>

      {/* 전체 필사 진척률 */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="m-0 text-sm font-medium text-slate-500">
              전체 성경 필사 진척률
            </p>

            <strong className="mt-2 block text-3xl text-slate-900">
              {profile.progressRate}%
            </strong>
          </div>

          <p className="m-0 text-sm text-slate-500">
            {profile.totalVerses.toLocaleString()} /
            31,102절
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand"
            style={{
              width: `${profile.progressRate}%`,
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>시작</span>
          <span>완독까지 꾸준히 기록해보세요.</span>
          <span>완료</span>
        </div>
      </section>

      {/* 뱃지 */}
      <section className="mt-8">
        <h2 className="m-0 text-xl font-bold text-slate-900">
          나의 기록 뱃지
        </h2>

        <p className="mb-0 mt-2 text-sm text-slate-500">
          꾸준히 필사하며 얻은 기록이에요.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {recentAchievements.map((achievement) => (
            <article
              key={achievement.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl">
                {achievement.emoji}
              </div>

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

      {/* 계정 설정 */}
      <section className="mt-8">
        <h2 className="m-0 text-xl font-bold text-slate-900">
          계정 설정
        </h2>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {settingItems.map((setting) => (
            <button
              key={setting.title}
              type="button"
              className="flex w-full items-center justify-between gap-4 border-0 border-b border-slate-100 bg-white px-5 py-5 text-left last:border-b-0 hover:bg-slate-50"
            >
              <span className="flex items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg">
                  {setting.emoji}
                </span>

                <span>
                  <strong className="block text-sm text-slate-900">
                    {setting.title}
                  </strong>

                  <span className="mt-1 block text-xs text-slate-500">
                    {setting.description}
                  </span>
                </span>
              </span>

              <span
                aria-hidden="true"
                className="text-slate-300"
              >
                ›
              </span>
            </button>
          ))}

          {/* 알림 설정 */}
          <div className="flex items-center justify-between gap-4 px-5 py-5">
            <span className="flex items-center gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg">
                🔔
              </span>

              <span>
                <strong className="block text-sm text-slate-900">
                  필사 알림
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  매일 필사 시간을 알려드립니다.
                </span>
              </span>
            </span>

            <button
              type="button"
              aria-pressed={notificationEnabled}
              aria-label="필사 알림 설정"
              onClick={() =>
                setNotificationEnabled(
                  (currentValue) => !currentValue,
                )
              }
              className={[
                "relative h-7 w-12 rounded-full border-0 p-0 transition",
                notificationEnabled
                  ? "bg-brand"
                  : "bg-slate-300",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                  notificationEnabled
                    ? "left-6"
                    : "left-1",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 로그아웃 */}
      <section className="mt-6 flex justify-end">
        <Link
          to="/login"
          className="text-sm font-semibold text-slate-400 no-underline transition hover:text-red-500"
        >
          로그아웃
        </Link>
      </section>
    </main>
  );
}

export default ProfilePage;