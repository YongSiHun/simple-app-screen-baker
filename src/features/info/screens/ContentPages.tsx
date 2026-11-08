import { Link, useParams } from 'react-router';
import { ContentLayout, InfoLink, ToolLink } from '../components/ContentLayout';
import { GUIDE_ARTICLES } from '../content/guides';
import { FAQ } from '../content/faq';
import {
  STORE_REQUIREMENTS,
  REQUIREMENTS_CHECKED_AT,
} from '../content/requirements';
import { PRESETS } from '../../export/constants/presets';

export function GuidesPage() {
  return (
    <ContentLayout
      title="스크린샷 제작 팁"
      description="어떤 화면을 고를지, 문구는 어떻게 쓸지 고민될 때 참고해보세요. 처음 제작하는 분에게 필요한 팁을 모았습니다."
      kicker="제작 팁"
    >
      <p>
        차근차근 따라 하는 제작 순서는 <Link to="/guide">사용 가이드</Link>,
        스토어 등록 조건은 <Link to="/requirements">플랫폼별 규격</Link>에서
        확인하세요.
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
        kicker="제작 팁 안내"
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
            <Link to="/requirements">플랫폼 규격과 공식 안내</Link>
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
      title="스토어에 맞는 이미지 크기 확인하기"
      description="등록할 기기의 이미지 크기와 수량을 확인하세요. 이 도구에서 만들 수 있는 크기도 함께 안내합니다."
      kicker="플랫폼 규격"
    >
      <p className="document-callout">
        규격 확인일:{' '}
        <time dateTime={REQUIREMENTS_CHECKED_AT}>
          {REQUIREMENTS_CHECKED_AT}
        </time>
        . 스토어의 기준은 바뀔 수 있습니다. 아래에는 대표적인 규격을 안내하므로
        등록 전 공식 안내와 스토어 등록 화면을 함께 확인해주세요.
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
            <dt>사용할 수 있는 파일</dt>
            <dd>{item.format}</dd>
            <dt>스토어가 안내하는 크기</dt>
            <dd>
              <ul>
                {item.sizes.map((size) => (
                  <li key={size}>{size}</li>
                ))}
              </ul>
            </dd>
            <dt>필요한 이미지 수</dt>
            <dd>{item.count}</dd>
            <dt>이 도구에서 만들 수 있는 크기</dt>
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
      <h2>완성한 이미지는 PNG로 저장됩니다</h2>
      <p>
        PNG, JPEG, WebP 파일을 올려 편집할 수 있으며, 완성한 결과는 투명한
        부분이 없는 PNG 이미지로 저장됩니다. ZIP으로 받았다면 먼저 압축을 풀고
        이미지를 한 장씩 등록해주세요. 이미지 크기는 화면에 제공되는 항목 중에서
        선택할 수 있습니다.
      </p>
      <p>
        이 도구는 Mac과 Chromebook용 이미지 크기도 제공합니다. 위 안내는 iPhone,
        iPad, Google Play 휴대폰과 태블릿을 중심으로 정리했습니다. 다른 기기에
        등록할 때는 해당 스토어의 공식 안내를 확인해주세요.
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
      description="무료 이용부터 이미지 저장과 다운로드까지, 이용하면서 궁금할 수 있는 내용을 모았습니다."
      kicker="이용 도움말"
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
