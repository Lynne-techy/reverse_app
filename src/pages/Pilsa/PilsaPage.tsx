import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { bookName } from "../../data/books";
import { getVersesInRange, type Verse } from "../../api/verses";
import {
  completeWritingSession,
  createUploadUrl,
  isTerminalStatus,
  uploadImageToStorage,
  type CompleteWritingSessionBody,
} from "../../api/writingSessions";
import { useWritingSessionStatus } from "../../hooks/useWritingSessionStatus";
import { RangeStep } from "./steps/RangeStep";
import { LanguageStep } from "./steps/LanguageStep";
import { PhotoStep } from "./steps/PhotoStep";
import { KeyVerseStep } from "./steps/KeyVerseStep";
import { QtStep } from "./steps/QtStep";

type LanguageMode = "ko" | "en";

const STEPS = ["범위 선택", "언어 선택", "사진 업로드", "Key Verse", "QT"];

// Supabase Storage 버킷 정책과 일치 — 이 두 타입만 업로드 허용(업로드 전 클라이언트에서 미리 검증).
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

// Supabase Storage 버킷의 파일당 상한과 맞춰 클라이언트에서 미리 거른다.
// (안 걸러지면 presigned URL PUT이 400으로 실패하는데, 이 요청은 우리 /api를 거치지 않아
// 응답 본문이 비어 있을 때가 많아 원인을 알기 어렵다 — 그래서 사전 검증이 특히 중요.)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * completeWritingSession의 `date` 필드용 — 사용자의 "로컬" 날짜(YYYY-MM-DD).
 * 잔디/streak 기준일이라 반드시 로컬 시간대 기준이어야 한다.
 */
function getClientDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function PilsaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // 추천 페이지에서 navigate("/pilsa", { state: { verse } })로 넘어온 구절(있으면 범위를 프리필).
  const incomingVerse = (location.state as { verse?: Verse } | null)?.verse;

  const [step, setStep] = useState(1);

  // 범위: bookNo는 1~66. 기본값은 창세기 1:1-6, 넘어온 구절이 있으면 그 구절 기준.
  const [bookNo, setBookNo] = useState(() => incomingVerse?.bookNo ?? 1);
  const [chapter, setChapter] = useState(() => incomingVerse?.chapter ?? 1);
  const [startVerse, setStartVerse] = useState(() => incomingVerse?.verseNo ?? 1);
  const [endVerse, setEndVerse] = useState(() => incomingVerse?.verseNo ?? 6);

  // 한·영 병행은 백엔드 미지원 → ko/en만.
  const [language, setLanguage] = useState<LanguageMode>("ko");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");

  // Key Verse는 문자열이 아니라 실제 절의 DB id를 저장한다(complete API의 keyVerseId).
  const [keyVerseId, setKeyVerseId] = useState<number | null>(null);

  const [meditation, setMeditation] = useState("");
  const [application, setApplication] = useState("");
  const [prayer, setPrayer] = useState("");

  // 2단계 createUploadUrl로 발급받는 세션·업로드 URL(3단계 업로드·5단계 완료에서 재사용).
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  // presigned uploadUrl은 1회용 — 이미 성공적으로 PUT한 적 있으면 같은 URL 재사용이 불가능하다.
  // (검사 실패 → 사진 단계로 돌아와 다른 사진으로 재업로드하는 경로에서 필요.)
  const [imageUploaded, setImageUploaded] = useState(false);

  // 단계 전환용 비동기 상태(2·3단계 "다음", 5단계 "저장"이 공유 — 한 번에 하나만 진행).
  const [stepStatus, setStepStatus] = useState<"idle" | "loading" | "error">("idle");
  const [stepError, setStepError] = useState("");

  // 완료(complete) 성공 후에만 폴링을 켜기 위한 플래그(sessionId는 2단계부터 존재하므로 분리).
  const [submitted, setSubmitted] = useState(false);

  // 이미지 미리보기 objectURL 생성/해제.
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  // 범위가 바뀌면 이전에 고른 Key Verse는 더 이상 유효하지 않으니 초기화.
  useEffect(() => {
    setKeyVerseId(null);
  }, [bookNo, chapter, startVerse, endVerse]);

  const rangeValid =
    Number.isFinite(startVerse) &&
    Number.isFinite(endVerse) &&
    startVerse >= 1 &&
    endVerse >= startVerse;

  // Key Verse 후보(step 4에 도달했을 때만 실제 절 범위를 조회).
  const {
    data: rangeVerses,
    isError: rangeError,
    isFetching: rangeFetching,
    refetch: refetchRange,
  } = useQuery({
    queryKey: ["verseRange", bookNo, chapter, startVerse, endVerse],
    queryFn: ({ signal }) =>
      getVersesInRange({ book: bookNo, chapter, from: startVerse, to: endVerse }, signal),
    enabled: step === 4 && rangeValid,
    staleTime: 5 * 60_000,
  });

  const selectedKeyVerse = rangeVerses?.find((verse) => verse.id === keyVerseId) ?? null;

  // 완료 후 유사도 검사 폴링. submitted가 true일 때만 켜지고, terminal(completed/failed)이면 멈춘다.
  const { data: polledSession } = useWritingSessionStatus(submitted ? sessionId : null);

  const isChecking = submitted && (!polledSession || !isTerminalStatus(polledSession.status));

  const result = polledSession && isTerminalStatus(polledSession.status) ? polledSession : null;

  const isBusy = stepStatus === "loading" || isChecking;

  const rangeLabel = `${bookName(bookNo)} ${chapter}:${startVerse}${
    endVerse > startVerse ? `-${endVerse}` : ""
  }`;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Supabase 정책과 동일한 검증을 업로드 전에 먼저 — 네트워크 타기 전 빠른 실패.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("JPG 또는 PNG 이미지만 업로드할 수 있어요.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("이미지 용량은 5MB 이하만 업로드할 수 있어요.");
      return;
    }

    setImageError("");
    setStepError(""); // 업로드 실패 후 사진을 바꾸면 이전 에러 배너는 지운다.
    setImage(file);
  };

  // 단계별 "다음" 진행 가능 조건.
  const canProceed = () => {
    switch (step) {
      case 1:
        return rangeValid;
      case 3:
        return Boolean(image);
      case 4:
        return keyVerseId !== null;
      default:
        return true;
    }
  };

  // 2단계 "다음": 임시 세션 + presigned 업로드 URL 발급. 성공해야만 3단계로 넘어간다.
  async function handleCreateSession() {
    setStepError("");
    setStepStatus("loading");

    try {
      const { sessionId: newSessionId, uploadUrl: newUploadUrl } = await createUploadUrl({
        book: bookNo,
        chapter,
        startVerseNo: startVerse,
        endVerseNo: endVerse,
        language,
      });

      setSessionId(newSessionId);
      setUploadUrl(newUploadUrl);
      setImageUploaded(false);
      setStepStatus("idle");
      nextStep(); // 성공 시에만 3단계로.
    } catch {
      setStepError("업로드 준비에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setStepStatus("error");
    }
  }

  // 3단계 "다음": 2단계에서 받은 uploadUrl로 이미지를 스토리지에 직접 업로드.
  async function handleUploadImage() {
    if (!image || !uploadUrl) return; // 버튼 gating과 이중 안전장치.

    setStepError("");
    setStepStatus("loading");

    try {
      // uploadUrl이 이미 한 번 성공적으로 소비됐다면(imageUploaded === true) 같은 URL로
      // 다시 PUT할 수 없으니(presigned URL은 1회용) createUploadUrl을 다시 호출해 새
      // sessionId/uploadUrl을 받아 그 값으로 업로드한다.
      let activeUploadUrl = uploadUrl;
      if (imageUploaded) {
        const { sessionId: newSessionId, uploadUrl: newUploadUrl } = await createUploadUrl({
          book: bookNo,
          chapter,
          startVerseNo: startVerse,
          endVerseNo: endVerse,
          language,
        });
        activeUploadUrl = newUploadUrl;
        setSessionId(newSessionId);
        setUploadUrl(newUploadUrl);
      }

      await uploadImageToStorage(activeUploadUrl, image);

      setImageUploaded(true);
      setStepStatus("idle");
      nextStep();
    } catch {
      setStepError("이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setStepStatus("error");
    }
  }

  // "다음" 버튼 디스패처 — 단계별로 동기 진행 or 비동기 작업.
  const handleNext = () => {
    switch (step) {
      case 2:
        return handleCreateSession();
      case 3:
        return handleUploadImage();
      default:
        return nextStep(); // 1·4단계는 검증만 통과하면 바로 다음.
    }
  };

  // 5단계 "저장하기": 완료 API만 호출. 성공하면 submitted=true로 폴링 시작.
  async function handleSave() {
    if (!sessionId || keyVerseId === null) return; // 버튼 gating과 이중 안전장치.

    setStepError("");
    setStepStatus("loading");

    try {
      // 빈 QT 필드는 아예 보내지 않는다(optional).
      const body: CompleteWritingSessionBody = {
        keyVerseId,
        date: getClientDate(),
        ...(meditation.trim() ? { meditation: meditation.trim() } : {}),
        ...(application.trim() ? { application: application.trim() } : {}),
        ...(prayer.trim() ? { prayer: prayer.trim() } : {}),
      };
      await completeWritingSession(sessionId, body);

      setSubmitted(true); // useWritingSessionStatus가 enabled되어 폴링 시작.
      setStepStatus("idle");
    } catch {
      setStepError("필사 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setStepStatus("error");
    }
  }

  // closeOverlay·handleFinishSuccess가 공통으로 하는 폴링 정리(submitted 끄기 + 상태 idle화).
  const stopPolling = () => {
    setSubmitted(false);
    setStepStatus("idle");
  };

  // 결과 오버레이 닫기 — "검사 실패" · "통과 못함" 케이스에서 쓴다.
  // 사진 단계(3)로 되돌려 바로 재업로드하게 하되, Key Verse·QT는 다시 쓸 필요 없도록 그대로 둔다
  // (keyVerseId/meditation/application/prayer는 여기서 건드리지 않는다).
  const closeOverlay = () => {
    stopPolling();
    setStep(3);
  };

  // 검사 통과(passed === true) 후 "확인" — 이미 completed된 세션이라 이 화면에 머물 이유가 없어
  // 대시보드로 보낸다.
  function handleFinishSuccess() {
    stopPolling();
    navigate("/mainpage");
  }

  // 에러 배너 "다시 시도" — 실패한 그 단계의 작업을 재실행.
  const retryStep = () => (step === 5 ? handleSave() : handleNext());

  const renderProgress = () => (
    <div className="mb-6 flex gap-1.5">
      {STEPS.map((label, index) => (
        <div className="flex flex-1 flex-col items-center gap-1.5" key={label}>
          <div
            className={`h-1 w-full rounded-full ${index + 1 <= step ? "bg-brand" : "bg-fill"}`}
          />

          <span
            className={`text-[10px] ${
              index + 1 === step ? "font-bold text-brand" : "font-medium text-sub"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  // 각 단계 화면은 steps/*로 분리 — 여기(틀)는 상태를 소유하고 props로 내려줄 뿐이다.
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <RangeStep
            bookNo={bookNo}
            setBookNo={setBookNo}
            chapter={chapter}
            setChapter={setChapter}
            startVerse={startVerse}
            setStartVerse={setStartVerse}
            endVerse={endVerse}
            setEndVerse={setEndVerse}
            rangeLabel={rangeLabel}
          />
        );
      case 2:
        return <LanguageStep language={language} setLanguage={setLanguage} />;
      case 3:
        return (
          <PhotoStep
            imagePreview={imagePreview}
            imageError={imageError}
            onUpload={handlePhotoUpload}
            onRemove={() => setImage(null)}
          />
        );
      case 4:
        return (
          <KeyVerseStep
            rangeVerses={rangeVerses}
            rangeError={rangeError}
            rangeFetching={rangeFetching}
            refetchRange={refetchRange}
            keyVerseId={keyVerseId}
            setKeyVerseId={setKeyVerseId}
            selectedKeyVerse={selectedKeyVerse}
            bookNo={bookNo}
            chapter={chapter}
          />
        );
      case 5:
        return (
          <QtStep
            meditation={meditation}
            setMeditation={setMeditation}
            application={application}
            setApplication={setApplication}
            prayer={prayer}
            setPrayer={setPrayer}
            rangeLabel={rangeLabel}
            language={language}
            selectedKeyVerse={selectedKeyVerse}
            bookNo={bookNo}
            chapter={chapter}
          />
        );
      default:
        return null;
    }
  };

  // similarityScore는 백엔드(Gemini 프롬프트 + parseSimilarityScore 클램프)에서 이미 0~100 스케일로 온다.
  const scoreText =
    result?.similarityScore != null ? `유사도 ${Math.round(result.similarityScore)}%` : null;

  const overlayCard = (children: React.ReactNode) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-6"
      role="status"
    >
      <div className="w-full max-w-[320px] rounded-2xl bg-white p-7 text-center shadow-[0_14px_34px_rgba(23,50,74,0.18)]">
        {children}
      </div>
    </div>
  );

  const renderOverlay = () => {
    if (isChecking) {
      return overlayCard(
        <>
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-soft border-t-brand motion-reduce:animate-none"
            aria-hidden="true"
          />

          <h2 className="text-lg font-bold text-ink">필사를 확인하고 있어요</h2>

          <p className="mt-1.5 text-[13px] text-sub">
            필사한 말씀이 본문과 얼마나 닮았는지 살펴보는 중이에요…
          </p>
        </>,
      );
    }

    if (!result) return null;

    if (result.status === "failed") {
      return overlayCard(
        <>
          <div
            className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-danger text-3xl font-extrabold text-white"
            aria-hidden="true"
          >
            !
          </div>

          <h2 className="text-lg font-bold text-ink">검사에 실패했어요</h2>

          <p className="mt-1.5 text-[13px] text-sub">사진을 다시 확인해 저장을 시도해 주세요.</p>

          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white"
            onClick={closeOverlay}
          >
            확인
          </button>
        </>,
      );
    }

    const passed = result.passed === true;

    return overlayCard(
      <>
        <div
          className={`mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-extrabold text-white ${
            passed ? "bg-success" : "bg-accent"
          }`}
          aria-hidden="true"
        >
          {passed ? "✓" : "🙂"}
        </div>

        <h2 className="text-lg font-bold text-ink">
          {passed ? "필사를 완료했어요!" : "조금 더 정확히 써볼까요?"}
        </h2>

        <p className="mt-1.5 text-[13px] text-sub">
          {rangeLabel}
          {scoreText ? ` · ${scoreText}` : ""}
        </p>

        <button
          type="button"
          className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white"
          onClick={passed ? handleFinishSuccess : closeOverlay}
        >
          확인
        </button>
      </>,
    );
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-body transition hover:bg-surface"
      >
        <span aria-hidden="true">←</span> 나가기
      </button>

      <div className="mb-6">
        <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary-deep">
          DAILY PILSA
        </span>

        <h1 className="mb-0 mt-3 text-2xl font-bold text-ink">성경 필사</h1>

        <p className="mb-0 mt-2 text-[13px] text-sub">한 글자씩 적으며 말씀을 마음에 새겨보세요.</p>
      </div>

      {renderProgress()}

      {stepStatus === "error" && (
        <div
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-[#f4a6ae] bg-[#fdecee] px-3.5 py-3"
          role="alert"
        >
          <span
            className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-danger text-xs font-extrabold text-white"
            aria-hidden="true"
          >
            !
          </span>

          <p className="flex-1 text-xs text-[#b4232e]">{stepError}</p>

          <button
            type="button"
            className="flex-none text-xs font-bold text-danger"
            onClick={retryStep}
          >
            다시 시도
          </button>
        </div>
      )}

      {renderCurrentStep()}

      <div className="mt-7 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            className="h-11 w-28 rounded-xl border border-border bg-white text-sm font-semibold text-ink transition hover:bg-surface"
            onClick={prevStep}
            disabled={stepStatus === "loading"}
          >
            이전
          </button>
        )}

        {step < 5 ? (
          <button
            type="button"
            className="h-11 flex-1 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleNext}
            disabled={!canProceed() || stepStatus === "loading"}
          >
            {stepStatus === "loading" ? "처리 중…" : "다음"}
          </button>
        ) : (
          <button
            type="button"
            className="h-11 flex-1 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSave}
            disabled={isBusy || !sessionId || keyVerseId === null}
          >
            {isBusy ? "저장 중…" : "저장하기"}
          </button>
        )}
      </div>

      {renderOverlay()}
    </main>
  );
}

export default PilsaPage;
