interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: number;
  className?: string;
}

/**
 * 로딩 자리 표시용 펄스 블록.
 * 애니메이션·스타일은 index.css의 `.rv-skeleton`(prefers-reduced-motion 존중).
 * 스크린리더에는 상위의 role="status"가 상태를 알리므로 여기선 aria-hidden.
 */
export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  className,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`rv-skeleton${className ? ` ${className}` : ""}`}
      style={{ display: "block", width, height, borderRadius: radius }}
    />
  );
}
