interface ErrorStateProps {
  /** 제목 (기본: "잠시 문제가 생겼어요") */
  title?: string;
  /** 안내 문구 */
  message?: string;
  /** "다시 시도" 콜백. 주면 버튼이 노출된다. */
  onRetry?: () => void;
  /** 다시 시도 버튼 라벨 */
  retryLabel?: string;
  /** "홈으로" 이동 경로 (기본 /mainpage). 라우터 밖(ErrorBoundary)에서도 쓰도록 <a>로 이동. */
  homeHref?: string;
  className?: string;
}

/**
 * 공통 에러 상태 화면. Figma "에러(불러오기 실패)" 화면의 코드 구현.
 * 데이터 로드 실패·라우트 에러 등에서 재사용한다(RecommendPage 전면 에러, ErrorBoundary 폴백 등).
 * 라우터에 의존하지 않도록 "홈으로"는 <a href>로 둔다(에러 후엔 풀 리로드가 오히려 안전).
 */
function ErrorState({
  title = "잠시 문제가 생겼어요",
  message = "말씀을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  onRetry,
  retryLabel = "다시 시도",
  homeHref = "/mainpage",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`mx-auto flex max-w-sm flex-col items-center px-6 py-12 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-3xl"
      >
        🌧️
      </span>

      <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>

      <div className="mt-7 flex w-full flex-col gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700"
          >
            {retryLabel}
          </button>
        )}

        <a
          href={homeHref}
          className="w-full rounded-2xl border border-slate-200 px-6 py-3.5 text-center font-bold text-slate-600 transition hover:border-blue-300 hover:text-brand"
        >
          홈으로
        </a>
      </div>
    </div>
  );
}

export default ErrorState;
