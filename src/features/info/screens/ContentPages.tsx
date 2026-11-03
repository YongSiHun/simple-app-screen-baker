import { Link, useParams } from 'react-router';
import { ContentLayout, InfoLink, ToolLink } from '../components/ContentLayout';
import { GUIDE_ARTICLES } from '../data/guides';
import { FAQ } from '../data/faq';
import {
  STORE_REQUIREMENTS,
  REQUIREMENTS_CHECKED_AT,
} from '../data/requirements';
import { PRESETS } from '../../export/constants/presets';

export function GuidesPage() {
  return (
    <ContentLayout
      title="스크린샷 제작 팁"
      description="앱의 가치를 한 장씩 설명하고, 실제 스토어에 제출하기까지의 편집 노하우를 모았습니다."
      kicker="SCREENSHOT FIELD NOTES"
    >
      <p>
        도구의 버튼 사용법은 <Link to="/guide">사용 가이드</Link>, 최신 제출
        조건은 <Link to="/requirements">플랫폼별 규격</Link>에서 확인하세요.
      </p>
      <div className="content-card-grid">
        {GUIDE_ARTICLES.map((article) => (
          <article key={article.slug} className="content-card">
            <span className="section-kicker">{article.category}</span>
            <h2>
              <Link to={'/guides/' + article.slug}>{article.title}</Link>
            </h2>
            <p>{article.description}</p>
            <small>
              수정 <time dateTime={article.updated}>{article.updated}</time>
            </small>
          </article>
        ))}
      </div>
      <ToolLink />
    </ContentLayout>
  );
}

export function GuideArticlePage() {
  const { slug } = useParams();
  const article = GUIDE_ARTICLES.find((item) => item.slug === slug);
  const isMissing = !article;

  if (isMissing) {
    return (
      <ContentLayout
        title="제작 팁을 찾을 수 없습니다"
        description="목록에서 다른 제작 팁을 선택해주세요."
        kicker="GUIDE NOT FOUND"
      >
        <Link to="/guides">제작 팁 목록</Link>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title={article.title}
      description={article.description}
      kicker={article.category}
      breadcrumbs={[
        { label: '제작 팁', href: '/guides' },
        { label: article.title, href: '/guides/' + article.slug },
      ]}
    >
      <article>
        <p className="content-date">
          작성 <time dateTime={article.published}>{article.published}</time> ·
          수정 <time dateTime={article.updated}>{article.updated}</time>
        </p>
        <nav className="content-toc" aria-label="이 글의 목차">
          <strong>이 글에서 확인할 내용</strong>
          <ol>
            {article.sections.map((section) => (
              <li key={section.id}>
                <a href={'#' + section.id}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        {article.sections.map((section) => (
          <section id={section.id} key={section.id} className="content-section">
            <h2>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {section.example && (
              <figure className="copy-example">
                <div>
                  <span>수정 전 예시</span>
                  <p>{section.example.before}</p>
                </div>
                <div>
                  <span>수정 후 예시</span>
                  <p>{section.example.after}</p>
                </div>
                <figcaption>{section.example.reason}</figcaption>
              </figure>
            )}
            {section.checklist && (
              <ul className="content-checklist">
                {section.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
      <aside className="document-callout" aria-label="다음으로 읽을 내용">
        <h2>이어서 읽기</h2>
        <ul>
          {article.related.map((slug) => {
            const related = GUIDE_ARTICLES.find((item) => item.slug === slug)!;

            return (
              <li key={slug}>
                <Link to={'/guides/' + slug}>{related.title}</Link>
              </li>
            );
          })}
          <li>
            <Link to="/requirements">플랫폼별 규격과 공식 출처</Link>
          </li>
        </ul>
      </aside>
      <ToolLink />
    </ContentLayout>
  );
}

export function RequirementsPage() {
  return (
    <ContentLayout
      title="플랫폼별 스크린샷 제출 요건"
      description="스토어의 공식 조건과 이 도구의 출력 프리셋을 구분해 확인하세요."
      kicker="STORE REQUIREMENTS"
    >
      <p className="document-callout">
        공식 문서 최종 확인:{' '}
        <time dateTime={REQUIREMENTS_CHECKED_AT}>
          {REQUIREMENTS_CHECKED_AT}
        </time>
        . 정책은 변경될 수 있습니다. 아래 Apple 크기는 대상 디스플레이의
        예시이며 전체 허용 크기 목록은 아닙니다. 제출 직전 공식 문서와 계정의
        기기·언어별 검증을 다시 확인하세요.
      </p>
      <nav className="content-toc" aria-label="기기별 규격">
        <ul>
          {STORE_REQUIREMENTS.map((item) => (
            <li key={item.id}>
              <a href={'#' + item.id}>{item.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      {STORE_REQUIREMENTS.map((item) => (
        <section id={item.id} key={item.id} className="requirement-card">
          <h2>{item.title}</h2>
          <dl>
            <dt>스토어 이미지 형식</dt>
            <dd>{item.format}</dd>
            <dt>공식 크기·비율 안내</dt>
            <dd>
              <ul>
                {item.sizes.map((size) => (
                  <li key={size}>{size}</li>
                ))}
              </ul>
            </dd>
            <dt>이미지 수</dt>
            <dd>{item.count}</dd>
            <dt>이 도구의 실제 출력</dt>
            <dd>
              {PRESETS.filter((p) => item.presetIds.includes(p.id)).map((p) => (
                <span className="preset-badge" key={p.id}>
                  {p.label} · {p.width} × {p.height}px · PNG
                </span>
              ))}
            </dd>
          </dl>
          <ul>
            {item.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <InfoLink {...item.source} />
        </section>
      ))}
      <h2>업로드 형식과 출력 형식은 다릅니다</h2>
      <p>
        이 도구에 올릴 수 있는 원본은 PNG·JPEG·WebP이며, 결과물은 알파 채널 없는
        RGB 24-bit PNG입니다. ZIP은 그 PNG들을 묶는 다운로드 형식이므로 압축을
        풀어 개별 이미지를 스토어에 등록하세요. 앱스토어 제출 대행이나 임의 크기
        출력 기능은 제공하지 않습니다.
      </p>
      <p>
        Mac·Chromebook용 기존 출력 프리셋도 있지만, 이 페이지의 비교 대상은
        iPhone·iPad·Google Play 스마트폰·태블릿입니다. 모든 공식 규격을 구현한
        것으로 해석하지 마세요.
      </p>
      <p>
        <Link to="/guide#submission">스토어 등록 단계 보기</Link> ·{' '}
        <Link to="/guides/submission-checklist">제출 전 점검 목록</Link>
      </p>
      <ToolLink />
    </ContentLayout>
  );
}

export function FaqPage() {
  return (
    <ContentLayout
      title="자주 묻는 질문"
      description="이미지 보관, 다운로드, 상업적 이용과 편집 환경에 관한 실제 서비스 동작을 안내합니다."
      kicker="QUESTIONS & ANSWERS"
    >
      <div className="faq-list">
        {FAQ.map((item) => (
          <details key={item.id} id={item.id}>
            <summary>{item.question}</summary>
            <div>
              <p>{item.answer}</p>
              <InfoLink {...item.link} />
            </div>
          </details>
        ))}
      </div>
      <ToolLink />
    </ContentLayout>
  );
}
