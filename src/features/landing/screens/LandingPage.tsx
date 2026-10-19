import { Link } from 'react-router';
import { Icon } from '../../../core/components/Icons';
/**
 * 소개 화면에 사용할 예시 기기 이미지를 표시합니다.
 */
function DemoPhone({ second = false }: { second?: boolean }) {
  return (
    <div className={'demo-poster ' + (second ? 'second' : '')}>
      <p>
        {second ? '하루의 작은 기록,' : '당신의 아이디어를'}
        <br />
        <b>{second ? '더 큰 변화로.' : '더 멋진 첫인상으로.'}</b>
      </p>
      <small>
        {second
          ? '매일 조금씩, 나만의 속도로'
          : '앱의 가치를 한눈에 보여주세요'}
      </small>
      <div className="demo-phone">
        <div className="camera" />
        <div className="sample-app">
          <span className="sample-top">
            9:41 <span>••• ▰</span>
          </span>
          <div className="sample-greeting">
            좋은 아침이에요 ☀<br />
            <strong>오늘도 가볍게 시작해요.</strong>
          </div>
          <div className="sample-card">
            <small>이번 주의 기록</small>
            <b>나를 위한 시간</b>
            <div className="bars">
              {[35, 55, 43, 75, 62, 90, 72].map((h, i) => (
                <i key={i} style={{ height: h + '%' }} />
              ))}
            </div>
            <span>월 화 수 목 금 토 일</span>
          </div>
          <b className="sample-heading">
            오늘의 작은 목표 <span>전체 보기 →</span>
          </b>
          {['물 한 잔으로 시작하기', '20분 산책하기', '좋아하는 책 읽기'].map(
            (v, i) => (
              <div className="sample-task" key={v}>
                <span>{['◉', '◷', '▤'][i]}</span>
                {v}
                <i>✓</i>
              </div>
            ),
          )}
          <div className="sample-bottom">⌂ ▥ ◯</div>
        </div>
      </div>
    </div>
  );
}

/**
 * 도구의 기능과 제작 흐름을 소개합니다.
 */
export function LandingPage() {
  return (
    <main id="main-content">
      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> 작은 앱을 위한, 가벼운 디자인 도구
          </div>
          <h1>
            앱 스크린샷을
            <br />
            <em>가장 간단하게.</em>
          </h1>
          <p>
            멋진 앱을 만들었다면, 이제 보여줄 차례.
            <br />
            스크린샷과 몇 줄의 문구로 스토어 이미지를 완성하세요.
          </p>
          <Link to="/editor" className="button hero-cta">
            무료로 시작하기 <Icon name="arrow" />
          </Link>
          <div className="hero-benefits">
            <span>
              <Icon name="check" size={15} /> 회원가입 없이
            </span>
            <span>
              <Icon name="check" size={15} /> 워터마크 없이
            </span>
            <span>
              <Icon name="check" size={15} /> 100% 무료
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-grid" />
          <DemoPhone />
          <DemoPhone second />
          <div className="floating-label">
            <span>✓</span>
            <div>
              <b>스토어에 올릴 준비 완료</b>
              <small>고해상도 · RGB PNG</small>
            </div>
          </div>
          <span className="visual-caption">Made with Screen Baker</span>
        </div>
      </section>
      <section className="trust-strip">
        <div className="shell">
          <span>
            앱을 만드는 데 집중하세요.
            <br />
            <b>스크린샷은 저희가 도울게요.</b>
          </span>
          <div>
            <Icon name="lock" />
            <p>
              <b>내 브라우저에서 안전하게</b>
              <small>이미지는 서버로 전송되지 않아요</small>
            </p>
          </div>
          <div>
            <Icon name="image" />
            <p>
              <b>App Store & Google Play</b>
              <small>스토어 규격에 맞는 고해상도 출력</small>
            </p>
          </div>
        </div>
      </section>
      <section className="section shell" id="features">
        <div className="section-head">
          <span className="section-kicker">LESS WORK. MORE LAUNCH.</span>
          <h2>필요한 것만, 제대로.</h2>
          <p>복잡한 디자인 툴을 배울 필요 없어요.</p>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: 'layers' as const,
              n: '01',
              title: '고민을 줄이는 템플릿',
              text: '세 가지 고정형 레이아웃. 제목과 화면이 자연스럽게 어우러지도록 배치해드려요.',
            },
            {
              icon: 'image' as const,
              n: '02',
              title: '어떤 기기에도 어울리게',
              text: '스크린샷 한 장으로 스마트폰부터 태블릿, PC까지. 원하는 출력 규격을 선택하세요.',
            },
            {
              icon: 'download' as const,
              n: '03',
              title: '클릭 한 번으로 완성',
              text: '한 장은 PNG로, 여러 장은 ZIP으로. 선명한 원본 해상도로 다운로드하세요.',
            },
          ].map((v) => (
            <article className="feature-card" key={v.n}>
              <div>
                <span className="feature-icon">
                  <Icon name={v.icon} size={24} />
                </span>
                <small>{v.n}</small>
              </div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="how-section">
        <div className="shell section">
          <div className="section-head">
            <span className="section-kicker">FROM SCREEN TO STORE</span>
            <h2>세 단계면, 구워집니다.</h2>
            <p>첫 스크린샷부터 다운로드까지 가볍게.</p>
          </div>
          <div className="steps">
            {[
              [
                '01',
                '화면을 올리고',
                'PNG, JPEG, WebP 파일을 드래그해 주세요.',
              ],
              [
                '02',
                '한마디를 더하고',
                '템플릿을 고르고 앱의 이야기를 적어주세요.',
              ],
              [
                '03',
                '다운로드하면 끝',
                '스토어 규격을 선택하고 PNG 또는 ZIP으로 저장하세요.',
              ],
            ].map((v) => (
              <article key={v[0]}>
                <span>{v[0]}</span>
                <h3>{v[1]}</h3>
                <p>{v[2]}</p>
              </article>
            ))}
          </div>
          <div className="platforms">
            <span>지원 플랫폼</span>
            <b>App Store</b>
            <i>✦</i>
            <b>Google Play</b>
            <i>✦</i>
            <b>Mac App Store</b>
          </div>
        </div>
      </section>
      <section className="section shell faq">
        <div>
          <span className="section-kicker">GOOD TO KNOW</span>
          <h2>궁금한 점이 있나요?</h2>
          <Link to="/guide">사용 가이드 살펴보기 →</Link>
        </div>
        <div>
          {[
            [
              '정말 무료인가요?',
              '네. MVP의 모든 이미지 생성 및 다운로드 기능을 무료로 이용할 수 있습니다. 워터마크나 회원가입도 없습니다.',
            ],
            [
              '업로드한 이미지는 어디에 저장되나요?',
              '원본과 편집 내용은 현재 브라우저 탭의 메모리에만 있습니다. 새로고침하거나 탭을 닫으면 사라지므로 먼저 다운로드해 주세요.',
            ],
            [
              '어떤 이미지가 필요한가요?',
              'PNG, JPEG, WebP 형식의 앱 화면 한 장이면 모든 기기 규격을 만들 수 있습니다. 기기별 화면을 따로 등록하면 해당 화면을 우선 사용합니다.',
            ],
            [
              '바로 스토어에 제출할 수 있나요?',
              '출력 크기와 RGB PNG 형식을 검사합니다. 다만 이미지 내용과 스토어별 제출 개수 등은 직접 확인해야 합니다.',
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="bottom-cta shell">
        <div>
          <span className="section-kicker">READY TO LAUNCH?</span>
          <h2>당신의 앱, 멋지게 소개해보세요.</h2>
          <p>Create app store screenshots, simply.</p>
        </div>
        <Link to="/editor" className="button">
          첫 스크린샷 만들기 <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}
