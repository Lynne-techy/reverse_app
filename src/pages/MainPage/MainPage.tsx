import { useEffect, useState } from "react";

import TodayVerse from "../../components/TodayVerse";
import ProgressCard from "../../components/ProgressCard";
import StreakCard from "../../components/StreakCard";
import ContributionGraph from "../../components/ContributionGraph";
import RecentRecords from "../../components/RecentRecords";

import {
  getMyProfile,
  getUserProgress,
} from "../../api/users";

import { getTodayVerse } from "../../api/verses";

import {
getActivity,
getMyStatistics,
} from "../../api/stats";

import { getRecentWritingRecords } from "../../api/writingSessions";

import type {
UserProfile,
UserProgress,
} from "../../api/users";

import type { Verse } from "../../api/verses";

import type {
DailyActivity,
MyStatistics,
} from "../../api/stats";

import type { WritingRecord } from "../../api/writingSessions";

// import { supabase } from "../../lib/supabase";

import "./MainPage.css";

/**

Date 객체를 사용자의 로컬 날짜 기준 YYYY-MM-DD로 변환합니다.


toISOString()은 UTC 기준이라 한국 시간과 날짜가 달라질 수 있으므로
오늘의 말씀과 활동 기록에는 로컬 날짜를 직접 조합합니다.
*/
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
잔디 그래프에 사용할 최근 1년 날짜 범위를 만듭니다.
*/
function getActivityDateRange() {
  const today = new Date();
  const startDate = new Date(today);

  startDate.setDate(today.getDate() - 364);

  return {
    from: formatLocalDate(startDate),
    to: formatLocalDate(today),
  };
}

// interface UserProgress {
//   coveredVerses: number;
//   totalVerses: number;
//   completedBooks: number;
//   progressRate: number;
// }

function MainPage() {
  // 사용자 프로필
  const [profile, setProfile] =  useState<UserProfile | null>(null);

  // 오늘의 말씀
  const [todayVerse, setTodayVerse] = useState<Verse | null>(null);

  // 전체 필사 진척률
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // 스트릭 및 필사 통계
  const [statistics, setStatistics] = useState<MyStatistics | null>(null);

  // 잔디 그래프 데이터
  const [activity, setActivity] = useState<DailyActivity[]>([]);

  // 최근 필사 기록
  const [recentRecords, setRecentRecords] = useState<WritingRecord[]>([]);

  // 메인 화면 전체 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 일부 또는 전체 API 호출 실패 메시지
  const [errorMessage, setErrorMessage] = useState("");
  // 화면에 보여줄 사용자 이름
  // const [userName, setUserName] = useState("사용자");

  // // 사용자 정보를 불러오는 중인지 확인
  // const [isLoading, setIsLoading] = useState(true);

  // // 진척률 데이터
  // const [progress, setProgress] = useState<UserProgress | null>(null);
  // const [progressLoading, setProgressLoading] = useState(true);

//   useEffect(() => {
//     const loadMainData = async () => {
//       try {
//          // 현재 로그인된 Supabase 세션 가져오기
//         const {
//           data: { session },
//           error,
//         } = await supabase.auth.getSession();

//         if (error) {
//           console.error("사용자 정보 불러오기 실패:", error);
//           setIsLoading(false);
//           return;
//         }

//         // 로그인하지 않은 상태
//         if (!session?.user) {
//           setUserName("사용자");
//           setIsLoading(false);
//           return;
//         }
        
//         // Google 로그인으로 받은 사용자 정보
//         const metadata = session.user.user_metadata;

//         const name =
//           metadata.full_name ||
//           metadata.name ||
//           session.user.email?.split("@")[0] ||
//           "사용자";

//         setUserName(name);

//         // Supabase Access Token
//         const accessToken = session.access_token;

//         const response = await fetch("/api/users/me/progress", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(
//             `진척률 조회 실패: ${response.status}`,
//           );
//         }

//         const progressData =
//           (await response.json()) as UserProgress;

//         setProgress(progressData);

      
//       } catch (error) {
//         console.error("메인 데이터 불러오기 실패:", error);
//       } finally {
//         setIsLoading(false);
//         setProgressLoading(false);
//       }
//       // setIsLoading(false);
//     };

//     void loadMainData();
//   }, []);

//   return (
//     <main className="mx-auto w-full max-w-5xl px-6 py-8">
//       {/* 인사 영역 */}
//       <section className="flex items-center justify-between rounded-2xl bg-blue-50 px-7 py-6">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-800">
//             {isLoading
//               ? "사용자 정보를 불러오는 중..."
//               : `안녕하세요, ${userName}님 👋`}
//           </h1>

//           <p className="mt-2 text-lg text-slate-500">
//             오늘도 한 글자씩, 만나러 가볼까요.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white hover:bg-blue-600"
//         >
//           ✎ 오늘 필사 시작
//         </button>
//       </section>

//       <div className="mt-6">
//         <TodayVerse />
//       </div>

//       <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
//         <ProgressCard />
//         <StreakCard />
//       </div>

//       <div className="mt-4">
//         <ContributionGraph />
//       </div>

//       <div className="mt-4">
//         <RecentRecords />
//       </div>
//     </main>
//   );
// }

// export default MainPage;

useEffect(() => {
  let isMounted = true;

  const loadMainData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const today = formatLocalDate(new Date());
      const { from, to } = getActivityDateRange();

      /**
       * 서로의 응답을 기다릴 필요가 없는 API들이므로
       * 동시에 요청합니다.
       *
       * Promise.allSettled()를 사용하면 하나의 API가 실패해도
       * 성공한 나머지 데이터는 화면에 표시할 수 있습니다.
       */
      const [
        profileResult,
        todayVerseResult,
        progressResult,
        statisticsResult,
        activityResult,
        recentRecordsResult,
      ] = await Promise.allSettled([
        getMyProfile(),
        getTodayVerse(today),
        getUserProgress(),
        getMyStatistics(),
        getActivity(from, to),
        getRecentWritingRecords(),
      ]);

      // 컴포넌트가 이미 사라진 경우 state를 변경하지 않습니다.
      if (!isMounted) {
        return;
      }

      const failedData: string[] = [];

      // 사용자 프로필
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        console.error(
          "사용자 프로필 조회 실패:",
          profileResult.reason,
        );

        failedData.push("사용자 정보");
      }

      // 오늘의 말씀
      if (todayVerseResult.status === "fulfilled") {
        setTodayVerse(todayVerseResult.value);
      } else {
        console.error(
          "오늘의 말씀 조회 실패:",
          todayVerseResult.reason,
        );

        failedData.push("오늘의 말씀");
      }

      // 필사 진척률
      if (progressResult.status === "fulfilled") {
        setProgress(progressResult.value);
      } else {
        console.error(
          "진척률 조회 실패:",
          progressResult.reason,
        );

        failedData.push("필사 진척률");
      }

      // 스트릭 및 필사 통계
      if (statisticsResult.status === "fulfilled") {
        setStatistics(statisticsResult.value);
      } else {
        console.error(
          "통계 조회 실패:",
          statisticsResult.reason,
        );

        failedData.push("필사 통계");
      }

      // 활동 기록
      if (activityResult.status === "fulfilled") {
        setActivity(activityResult.value);
      } else {
        console.error(
          "활동 기록 조회 실패:",
          activityResult.reason,
        );

        failedData.push("활동 기록");
      }

      // 최근 필사 기록
      if (recentRecordsResult.status === "fulfilled") {
        setRecentRecords(recentRecordsResult.value);
      } else {
        console.error(
          "최근 필사 기록 조회 실패:",
          recentRecordsResult.reason,
        );

        failedData.push("최근 필사 기록");
      }

      if (failedData.length > 0) {
        setErrorMessage(
          `${failedData.join(", ")} 데이터를 불러오지 못했습니다.`,
        );
      }
    } catch (error) {
      console.error("메인 데이터 불러오기 실패:", error);

      if (!isMounted) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "메인 화면 데이터를 불러오지 못했습니다.",
      );
    } finally {
            if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  void loadMainData();

  return () => {
    isMounted = false;
  };

  }, []); 

  /**

  백엔드 프로필에 displayName이 없으면
  기본값인 "사용자"를 표시합니다.
  */
  const userName = profile?.displayName || "사용자";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
    {/* 인사 영역 */}
    <section className="flex items-center justify-between rounded-2xl bg-blue-50 px-7 py-6">
    <div>
    <h1 className="text-3xl font-bold text-slate-800">
      {isLoading && !profile
        ? "사용자 정보를 불러오는 중..."
        : `안녕하세요, ${userName}님 👋`}
    </h1>

          <p className="mt-2 text-lg text-slate-500">
            오늘도 한 글자씩, 만나러 가볼까요.
          </p>
        </div>

        <button
          type="button"
          className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white hover:bg-blue-600"
        >
          ✎ 오늘 필사 시작
        </button>
      </section>

      {/* 일부 API가 실패한 경우 안내 */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {errorMessage}
        </div>
      )}

      {/* 오늘의 말씀 */}
      <div className="mt-6">
        <TodayVerse
          verse={todayVerse}
          isLoading={isLoading}
        />
      </div>

      {/* 진척률 및 스트릭 */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProgressCard
          progress={progress}
          isLoading={isLoading}
        />

        <StreakCard
          statistics={statistics}
          isLoading={isLoading}
        />
      </div>

      {/* 필사 활동 잔디 */}
      <div className="mt-4">
        <ContributionGraph
          activity={activity}
          isLoading={isLoading}
        />
      </div>

      {/* 최근 필사 기록 */}
      <div className="mt-4">
        <RecentRecords
          records={recentRecords}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}

export default MainPage;