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
}: EditorStatusProps) {
  return (
    <>
      <div className="editor-note">
        <span>새로고침하면 작업이 사라져요. 완료 후 다운로드해주세요.</span>
      </div>
      <div className="download-status" role="status" aria-live="polite">
        {hasExportableSlides && missing > 0 && (
          <span>이미지 없는 슬라이드 {missing}개는 ZIP에서 제외됩니다.</span>
        )}
        {progress && <span>{progress}…</span>}
        {done && <span className="success">{done}</span>}
      </div>
      {error && (
        <p className="download-error error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
