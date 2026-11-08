export function PreviewFeedback({
  loading,
  ready,
  error,
}: {
  loading: boolean;
  ready: boolean;
  error: string;
}) {
  const showLoading = loading && !ready;

  return (
    <>
      {showLoading && (
        <span className="preview-loading" role="status">
          미리보기 갱신 중…
        </span>
      )}
      {error && (
        <p className="preview-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
