import { useEffect, useState } from "react";
import "./PilsaPage.css";

type LanguageMode = "ko" | "en" | "bilingual";

const BOOKS = [
  "창세기",
  "출애굽기",
  "레위기",
  "민수기",
  "신명기",
  "여호수아",
  "사사기",
  "룻기",
  "사무엘상",
  "사무엘하",
  "열왕기상",
  "열왕기하",
  "역대상",
  "역대하",
  "에스라",
  "느헤미야",
  "에스더",
  "욥기",
  "시편",
  "잠언",
  "전도서",
  "아가",
  "이사야",
  "예레미야",
  "에스겔",
  "다니엘",
  "마태복음",
  "마가복음",
  "누가복음",
  "요한복음",
];

const STEPS = [
  "범위 선택",
  "언어 선택",
  "사진 업로드",
  "Key Verse",
  "QT",
];

function PilsaPage() {
  const [step, setStep] = useState(1);

  // 저장 상태 머신: idle → saving → success | error (alert 대신 인앱 피드백)
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveError, setSaveError] = useState("");

  const [book, setBook] = useState("시편");
  const [chapter, setChapter] = useState(23);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(6);

  // 한·영 병행은 아직 미지원이라 기본값을 한국어로 둔다(병행 옵션은 UI에서 숨김).
  const [language, setLanguage] =
    useState<LanguageMode>("ko");

  const [koImage, setKoImage] = useState<File | null>(null);
  const [enImage, setEnImage] = useState<File | null>(null);

  const [koPreview, setKoPreview] =
    useState<string | null>(null);

  const [enPreview, setEnPreview] =
    useState<string | null>(null);

  useEffect(() => {
    if (!koImage) {
      setKoPreview(null);
      return;
    }

    const url = URL.createObjectURL(koImage);
    setKoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [koImage]);

  useEffect(() => {
    if (!enImage) {
      setEnPreview(null);
      return;
    }

    const url = URL.createObjectURL(enImage);
    setEnPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [enImage]);

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    target: "ko" | "en"
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (target === "ko") {
      setKoImage(file);
    } else {
      setEnImage(file);
    }
  };

  const renderProgress = () => (
    <div className="pilsa-progress-wrapper">
      {STEPS.map((label, index) => (
        <div
          className="progress-item"
          key={label}
        >
          <div
            className={`progress-bar ${
              index + 1 <= step ? "active" : ""
            }`}
          />

          <span
            className={`progress-label ${
              index + 1 === step ? "active" : ""
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  const renderRangeStep = () => (
    <div className="step-content">

      <div className="card">
        <div className="section-label">
          ① 성경 선택
        </div>

        <select
          className="pilsa-select"
          value={book}
          onChange={(e) =>
            setBook(e.target.value)
          }
        >
          {BOOKS.map((bookName) => (
            <option
              key={bookName}
              value={bookName}
            >
              {bookName}
            </option>
          ))}
        </select>
      </div>

      <div className="card">

        <div className="section-label">
          ② 장 선택
        </div>

        <input
          className="pilsa-input"
          type="number"
          value={chapter}
          onChange={(e) =>
            setChapter(Number(e.target.value))
          }
        />
      </div>

      <div className="card">

        <div className="section-label">
          ③ 절 범위
        </div>

        <div className="verse-range">
          <input
            type="number"
            className="pilsa-input"
            value={startVerse}
            onChange={(e) =>
              setStartVerse(
                Number(e.target.value)
              )
            }
          />

          <span>~</span>

          <input
            type="number"
            className="pilsa-input"
            value={endVerse}
            onChange={(e) =>
              setEndVerse(
                Number(e.target.value)
              )
            }
          />
        </div>
      </div>

      <div className="selected-range-card">
        <span>선택한 범위</span>

        <h2>
          {book} {chapter}:{startVerse}
          {endVerse > startVerse
            ? `-${endVerse}`
            : ""}
        </h2>
      </div>
    </div>
  );

  const renderLanguageStep = () => (
    <div className="step-content">

      <button
        type="button"
        className={`language-card ${
          language === "ko"
            ? "selected"
            : ""
        }`}
        onClick={() =>
          setLanguage("ko")
        }
      >
        <div className="language-icon">
          🇰🇷
        </div>

        <div>
          <h3>한국어</h3>
          <p>
            우리말 성경으로 필사
          </p>
        </div>
      </button>

      <button
        type="button"
        className={`language-card ${
          language === "en"
            ? "selected"
            : ""
        }`}
        onClick={() =>
          setLanguage("en")
        }
      >
        <div className="language-icon">
          🇺🇸
        </div>

        <div>
          <h3>English</h3>
          <p>
            NIV / ESV 필사
          </p>
        </div>
      </button>

      {/* 한·영 병행은 아직 미지원이라 임시로 숨김 (기능 준비되면 복원). */}
    </div>
  );

  const renderPhotoStep = () => (
    <div className="step-content">

      <div className="upload-card">

        <div className="upload-title">
          한국어 노트
        </div>

        <label className="upload-zone">
          {koPreview ? (
            <img
              src={koPreview}
              className="upload-preview"
            />
          ) : (
            <span>
              📷 사진 업로드
            </span>
          )}

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              handlePhotoUpload(
                e,
                "ko"
              )
            }
          />
        </label>
      </div>

      {language ===
        "bilingual" && (
        <div className="upload-card">

          <div className="upload-title">
            영어 노트
          </div>

          <label className="upload-zone">
            {enPreview ? (
              <img
                src={enPreview}
                className="upload-preview"
              />
            ) : (
              <span>
                📷 사진 업로드
              </span>
            )}

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                handlePhotoUpload(
                  e,
                  "en"
                )
              }
            />
          </label>
        </div>
      )}
    </div>
  );
    const [selectedVerse, setSelectedVerse] =
    useState("");

  const [qtNote, setQtNote] =
    useState("");

  // 선택한 절 범위(startVerse~endVerse) 전체를 Key Verse 후보로 노출한다.
  // (기존엔 시작·시작+1·끝 3개만 하드코딩돼 있어 범위가 넓어도 3개만 보였음)
  const keyVerseOptions =
    Number.isFinite(startVerse) &&
    Number.isFinite(endVerse) &&
    endVerse >= startVerse
      ? Array.from(
          { length: endVerse - startVerse + 1 },
          (_, i) =>
            `${book} ${chapter}:${startVerse + i}`
        )
      : [`${book} ${chapter}:${startVerse}`];

  const renderKeyVerseStep = () => (
    <div className="step-content">

      <div className="card">
        <div className="section-label">
          마음에 남은 말씀
        </div>

        <div className="verse-list">
          {keyVerseOptions.map(
            (verse) => (
              <button
                key={verse}
                type="button"
                className={`verse-option ${
                  selectedVerse === verse
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedVerse(
                    verse
                  )
                }
              >
                {verse}
              </button>
            )
          )}
        </div>
      </div>

      <div className="selected-range-card">
        <span>선택한 Key Verse</span>

        <h2>
          {selectedVerse ||
            "말씀을 선택해주세요"}
        </h2>
      </div>
    </div>
  );

  const renderQtStep = () => (
    <div className="step-content">

      <div className="card">
        <div className="section-label">
          QT 묵상 기록
        </div>

        <textarea
          className="qt-textarea"
          placeholder="오늘 말씀을 통해 느낀 점, 결단한 내용, 감사한 점 등을 자유롭게 적어보세요."
          value={qtNote}
          onChange={(e) =>
            setQtNote(
              e.target.value
            )
          }
        />
      </div>

      <div className="summary-card">

        <h3>
          오늘의 필사 요약
        </h3>

        <div className="summary-item">
          <span>범위</span>

          <strong>
            {book} {chapter}:
            {startVerse}
            {endVerse >
            startVerse
              ? `-${endVerse}`
              : ""}
          </strong>
        </div>

        <div className="summary-item">
          <span>언어</span>

          <strong>
            {language === "ko"
              ? "한국어"
              : language ===
                "en"
              ? "영어"
              : "한·영 병행"}
          </strong>
        </div>

        <div className="summary-item">
          <span>
            Key Verse
          </span>

          <strong>
            {selectedVerse ||
              "-"}
          </strong>
        </div>
      </div>
    </div>
  );

  const handleSave = async () => {
    setSaveError("");
    setSaveStatus("saving");

    const payload = {
      book,
      chapter,
      startVerse,
      endVerse,
      language,
      selectedVerse,
      qtNote,
      koImage,
      enImage,
    };

    try {
      // TODO: 백엔드 저장 API(writing-sessions) 연결 — 지금은 로컬 확인용.
      // 실제 연결 시 이 자리에서 await 하고, 실패는 catch로 떨어진다.
      console.log("Pilsa Save", payload);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaveStatus("success");
    } catch {
      setSaveError(
        "필사 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
      setSaveStatus("error");
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderRangeStep();

      case 2:
        return renderLanguageStep();

      case 3:
        return renderPhotoStep();

      case 4:
        return renderKeyVerseStep();

      case 5:
        return renderQtStep();

      default:
        return null;
    }
  };

  return (
    <div className="pilsa-page">

      <div className="pilsa-container">

        <div className="page-header">

          <span className="page-badge">
            DAILY PILSA
          </span>

          <h1 className="page-title">
            성경 필사
          </h1>

          <p className="page-subtitle">
            한 글자씩 적으며
            말씀을 마음에
            새겨보세요.
          </p>

        </div>

        {renderProgress()}

        {saveStatus === "error" && (
          <div className="save-error" role="alert">
            <span className="save-error-icon" aria-hidden="true">
              !
            </span>

            <p>{saveError}</p>

            <button
              type="button"
              className="save-error-retry"
              onClick={handleSave}
            >
              다시 시도
            </button>
          </div>
        )}

        {renderCurrentStep()}

        <div className="bottom-actions">

          {step > 1 && (
            <button
              type="button"
              className="secondary-button"
              onClick={
                prevStep
              }
            >
              이전
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              className="primary-button"
              onClick={
                nextStep
              }
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving"
                ? "저장 중…"
                : "저장하기"}
            </button>
          )}

        </div>

      </div>

      {saveStatus === "success" && (
        <div className="save-success" role="status">
          <div className="save-success-card">
            <svg
              className="check"
              viewBox="0 0 52 52"
              aria-hidden="true"
            >
              <circle
                className="check-circle"
                cx="26"
                cy="26"
                r="24"
              />
              <path
                className="check-mark"
                d="M14 27 l8 8 l16 -18"
              />
            </svg>

            <h2>필사 기록을 저장했어요</h2>

            <p>
              {book} {chapter}:{startVerse}
              {endVerse > startVerse ? `-${endVerse}` : ""} · 오늘도 한 걸음
            </p>

            <button
              type="button"
              className="save-success-btn"
              onClick={() => setSaveStatus("idle")}
            >
              확인
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default PilsaPage;
