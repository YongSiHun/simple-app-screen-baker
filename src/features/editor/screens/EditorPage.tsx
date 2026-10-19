import { useState } from 'react';
import { useProject } from '../store/useProject';
import { PRESETS } from '../../export/constants/presets';
import { PreviewPanel } from '../components/PreviewPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { SlideList } from '../components/SlideList';
import { EditorHeader } from '../components/EditorHeader';
import { EditorStatus } from '../components/EditorStatus';
import { useEditorDownload } from '../hooks/useEditorDownload';
import { useHistoryShortcuts } from '../hooks/useHistoryShortcuts';
import { getImage, getSlideImage } from '../services/images';
import { createExportPlan } from '../../export/services/plan';
/**
 * 프로젝트 상태와 편집 화면의 주요 영역을 연결합니다.
 */
export function EditorPage() {
  const { project, selectedId, presetId, setPreset } = useProject();
  const [uploading, setUploading] = useState(false);
  const preset = PRESETS.find((preset) => preset.id === presetId)!;
  const slide = project.slides.find((slide) => slide.id === selectedId)!;
  const plan = createExportPlan(project.slides, [preset], (id) =>
    Boolean(getImage(id)),
  );
  const currentImage = getSlideImage(slide, preset.device);
  const { progress, error, done, exporting, download } = useEditorDownload(
    project,
    slide,
    preset,
    uploading,
  );
  const busy = exporting || uploading;
  useHistoryShortcuts(busy);

  return (
    <div className="editor">
      <a href="#main-content" className="skip-link">
        본문으로 건너뛰기
      </a>
      <EditorHeader
        presetId={presetId}
        busy={busy}
        canDownloadZip={plan.jobs.length > 0}
        canDownloadPng={Boolean(currentImage)}
        setPreset={setPreset}
        download={download}
      />
      <EditorStatus
        hasExportableSlides={plan.jobs.length > 0}
        missing={plan.missing}
        progress={progress}
        done={done}
        error={error}
      />
      <fieldset disabled={busy} className="editor-workspace">
        <SettingsPanel
          kind={preset.device}
          preset={preset}
          onUploading={setUploading}
        />
        <main id="main-content" className="editor-main">
          <h1 className="sr-only">스크린샷 편집</h1>
          {preset.platform === 'google-play' && preset.device !== 'phone' && (
            <p className="store-notice">
              Google Play 대형 화면은 앱 외 설명 문구를 제외하도록 안내합니다.
              제출 전 제목·부제목을 비우고 Frameless 템플릿을 사용해주세요. 최소
              4장의 앱 화면을 준비하세요.
            </p>
          )}
          <PreviewPanel
            key={preset.id + ':' + project.design.frame}
            preset={preset}
            disabled={busy}
            design={project.design}
            slide={slide}
          />
          <SlideList kind={preset.device} />
        </main>
      </fieldset>
    </div>
  );
}
