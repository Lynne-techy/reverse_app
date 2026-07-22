interface PhotoStepProps {
  imagePreview: string | null;
  imageError: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function PhotoStep({ imagePreview, imageError, onUpload, onRemove }: PhotoStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="text-[13px] font-bold text-ink">필사 노트</div>

        <div className="relative mt-3">
          <label className="flex min-h-[420px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-border-strong bg-surface transition hover:border-brand">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="max-h-[500px] w-full rounded-xl object-contain"
                alt="업로드한 필사 사진"
              />
            ) : (
              <>
                <span className="text-3xl">📷</span>
                <span className="text-[13px] font-medium text-sub">사진 업로드</span>
              </>
            )}

            <input type="file" accept="image/jpeg,image/png" hidden onChange={onUpload} />
          </label>

          {imagePreview && (
            <button
              type="button"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/55 text-white transition hover:bg-ink/80"
              onClick={onRemove}
              aria-label="사진 삭제"
            >
              ✕
            </button>
          )}
        </div>

        {imageError && (
          <p className="mt-3 text-[13px] font-semibold text-danger" role="alert">
            {imageError}
          </p>
        )}
      </div>
    </div>
  );
}
