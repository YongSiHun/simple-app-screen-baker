import type { DeviceKind, OutputPreset } from '../types/project';
import { useProject } from '../store/useProject';
import { getSlideImage } from '../services/images';
import { Icon } from '../../../core/components/Icons';
import { DEVICE_LABELS as labels } from '../constants/devices';
import { useScreenshotUpload } from '../hooks/useScreenshotUpload';
import {
  deviceGeometry,
  recommendedImageSize,
  imageAspectRatio,
} from '../../rendering/utils/deviceGeometry';
/**
 * 이미지 재사용 여부에 맞는 업로드 안내 문구를 만듭니다.
 */
function uploadHint(image: ReturnType<typeof getSlideImage>, kind: DeviceKind) {
  const hasNoImage = image === undefined;

  if (hasNoImage) {
    return '한 장으로 모든 기기 규격 생성 · 여러 장 선택 가능';
  }

  const isReusedImage = image.reused;

  if (isReusedImage) {
    return (
      labels[image.device] +
      ' 화면 재사용 중 · ' +
      labels[kind] +
      ' 전용 화면 추가 가능'
    );
  }

  return labels[kind] + ' 화면 교체 · 여러 장 선택 가능';
}

/**
 * 이미지 업로드 영역과 원본 권장 크기를 표시합니다.
 */
export function ScreenshotUpload({
  kind,
  preset,
  onUploading,
}: {
  kind: DeviceKind;
  preset: OutputPreset;
  onUploading: (busy: boolean) => void;
}) {
  const { project, selectedId } = useProject();
  const slide = project.slides.find((slide) => slide.id === selectedId)!;
  const image = getSlideImage(slide, kind);
  const { frame, screen, aspect } = deviceGeometry(
    preset.width,
    preset.height,
    project.design,
    kind,
  );
  const source = image?.bitmap ?? aspect;
  const recommended = recommendedImageSize(screen, source);
  const ratio = imageAspectRatio(source.width, source.height);
  const { input, drag, setDrag, busy, error, upload } = useScreenshotUpload(
    kind,
    onUploading,
  );

  return (
    <section>
      <h3>
        <span>01</span> 앱 스크린샷
      </h3>
      <button
        className={'upload-zone ' + (drag ? 'dragging' : '')}
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void upload(e.dataTransfer.files);
        }}
      >
        <span className="upload-icon">
          <Icon name="upload" size={23} />
        </span>
        <b>{busy ? '이미지 읽는 중…' : '클릭 또는 드래그하여 업로드'}</b>
        <span className="upload-recommendation">
          <span>{labels[frame]} 첨부 이미지 권장 해상도</span>
          <strong>
            {recommended.width.toLocaleString()} ×{' '}
            {recommended.height.toLocaleString()} px 이상 ({ratio})
          </strong>
          {image && (
            <small>
              원본 {image.bitmap.width.toLocaleString()} ×{' '}
              {image.bitmap.height.toLocaleString()} px ·{' '}
              {recommended.sufficient ? '충분한 해상도' : '더 큰 원본 권장'}
            </small>
          )}
        </span>
        <small>PNG, JPEG, WebP · 파일당 최대 25MB</small>
        <em>{uploadHint(image, kind)}</em>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        hidden
        onChange={(e) => void upload(e.target.files)}
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
