// 감정 8종 정적 매핑 — 백엔드 EMOTION_CODES(emotion_tags.code)와 1:1로 맞춘다.
//
// 칩 라벨·이모지·히어로 격려 카피는 "구절"이 아니라 UI 카피라 프론트가 소유한다.
// 추천 API(GET /verses/recommendations)는 구절만 무작위로 반환하므로,
// 감정별 톤(어떤 문구로 위로할지)은 여기서 정의해 화면이 소비한다.

export type EmotionCode =
  "depression" | "fear" | "gratitude" | "love" | "anxiety" | "joy" | "loneliness" | "weariness";

export interface Emotion {
  code: EmotionCode;
  /** 칩 앞에 붙는 이모지 */
  emoji: string;
  /** 칩에 보이는 문구 */
  label: string;
  /** 히어로 추천 카드의 격려 제목(구절이 아닌 프론트 카피) */
  heroCopy: string;
  /**
   * 밤하늘 "보석 별" 빛깔 — 감정이 큐레이션된 절이 든 별의 글로우 색.
   * 어두운 배경(#070a1a) 위에서 빛나야 하므로 전부 밝은 파스텔 계열로 잡는다.
   */
  starColor: string;
  /** 색 범례 등 좁은 자리용 한 단어 이름 (label은 문장형이라 길다). */
  shortLabel: string;
}

// 표시 순서: 기존 목업 4종(지침·불안·감사·외로움)의 톤을 앞쪽에 유지하고 나머지 4종을 확장.
export const EMOTIONS: Emotion[] = [
  {
    code: "weariness",
    emoji: "😮‍💨",
    label: "지치고 힘들어요",
    heroCopy: "오늘은 잠시 쉬어가도 괜찮아요",
    starColor: "#cdbcf0", // 쉼의 라벤더
    shortLabel: "지침",
  },
  {
    code: "anxiety",
    emoji: "😟",
    label: "마음이 불안해요",
    heroCopy: "불안한 마음을 맡겨보세요",
    starColor: "#b79bff", // 감싸는 보라
    shortLabel: "불안",
  },
  {
    code: "depression",
    emoji: "🌧️",
    label: "마음이 가라앉아요",
    heroCopy: "무거운 마음, 함께 견뎌요",
    starColor: "#86b0ff", // 비 갠 뒤 파랑
    shortLabel: "우울",
  },
  {
    code: "fear",
    emoji: "😨",
    label: "두려운 일이 있어요",
    heroCopy: "두려움 앞에서 담대해져요",
    starColor: "#8adfe8", // 잔잔해진 청록
    shortLabel: "두려움",
  },
  {
    code: "loneliness",
    emoji: "🌙",
    label: "외롭고 쓸쓸해요",
    heroCopy: "혼자가 아니라는 걸 기억해요",
    starColor: "#ccd8f2", // 달빛 은청
    shortLabel: "외로움",
  },
  {
    code: "gratitude",
    emoji: "😊",
    label: "감사한 마음이에요",
    heroCopy: "감사의 순간을 기록해보세요",
    starColor: "#ffce8f", // 깊은 호박
    shortLabel: "감사",
  },
  {
    code: "joy",
    emoji: "😄",
    label: "기쁜 일이 있어요",
    heroCopy: "기쁨을 함께 나눠요",
    starColor: "#ffdf78", // 환한 금빛
    shortLabel: "기쁨",
  },
  {
    code: "love",
    emoji: "💗",
    label: "사랑을 나누고 싶어요",
    heroCopy: "사랑 안에 머물러요",
    starColor: "#ffa8cd", // 로즈 핑크
    shortLabel: "사랑",
  },
];

/** code → 밤하늘 보석 별 색. */
export const EMOTION_STAR_COLORS: Record<EmotionCode, string> = Object.fromEntries(
  EMOTIONS.map((e) => [e.code, e.starColor]),
) as Record<EmotionCode, string>;
