import type { EditorStatusProps } from '../types/components';
/**
 * 편집 주의사항과 다운로드 진행 상태를 표시합니다.
 */
export function EditorStatus({
  hasExportableSlides,
  missing,
  progress,
  done,
  error,
  onDismissDone,
}: EditorStatusProps) {
  const hasDownloadFeedback = Boolean(progress || error);
  const showZipNotice =
    hasExportableSlides && missing > 0 && !hasDownloadFeedback;

  return (
    <>
      <div className="editor-note">
        <span>새로고침하면 작업이 사라져요. 완료 후 다운로드해주세요.</span>
      </div>
      <div className="download-status" role="status" aria-live="polite">
        {showZipNotice && (
          <span>이미지 없는 슬라이드 {missing}개는 ZIP에서 제외됩니다.</span>
        )}
        {progress && <span>{progress}…</span>}
      </div>
      {done && (
        <div
          className="download-toast"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{done}</span>
          <button
            type="button"
            onClick={onDismissDone}
            aria-label="다운로드 완료 알림 닫기"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
      {error && (
        <p className="download-error error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
