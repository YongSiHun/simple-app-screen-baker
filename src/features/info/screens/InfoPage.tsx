import { Link } from 'react-router';
import { GOOGLE_SOURCE } from '../../export/constants/presets';
import { WORKFLOW } from '../content/workflow';
import { APPLE_UPLOAD_SOURCE } from '../content/requirements';
import { ContentLayout, InfoLink, ToolLink } from '../components/ContentLayout';

export function GuidePage() {
  return (
    <ContentLayout
      title="앱 스크린샷, 이렇게 만들어보세요"
      description="앱 화면을 올리고, 디자인과 문구를 고른 뒤 저장하세요. 처음 사용하는 분도 순서대로 따라 할 수 있습니다."
      kicker="사용 가이드"
    >
      <p className="document-callout">
        컴퓨터의 넓은 화면에서 사용해주세요. 작업은 자동 저장되지 않으므로
        새로고침하거나 탭을 닫기 전에 완성한 이미지를 다운로드하세요.
      </p>
      <nav className="content-toc" aria-label="제작 단계 바로가기">
        <ol>
          {WORKFLOW.map((step, i) => (
            <li key={step.title}>
              <a
                href={
                  '#' +
                  (i === 5
                    ? 'downloads'
                    : i === 6
                      ? 'submission'
                      : 'step-' + (i + 1))
                }
              >
                {step.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <ol className="workflow-steps">
        {WORKFLOW.map((step, i) => (
          <li
            key={step.title}
            id={
              i === 5 ? 'downloads' : i === 6 ? 'submission' : 'step-' + (i + 1)
            }
          >
            <span className="workflow-number" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.instruction}</p>
              <p className="workflow-check">
                <strong>확인해주세요</strong> {step.check}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <section className="document-callout">
        <h2>스토어에 올리기 전에</h2>
        <p>
          필요한 이미지 크기와 수량은{' '}
          <Link to="/requirements">플랫폼 규격</Link>에서 확인하세요. 스토어의
          등록 화면과 기준은 바뀔 수 있으니 아래 공식 안내도 함께 확인해주세요.
        </p>
        <ul>
          <li>
            <InfoLink
              href={APPLE_UPLOAD_SOURCE}
              label="App Store 이미지 등록 안내"
            />
          </li>
          <li>
            <InfoLink
              href={GOOGLE_SOURCE}
              label="Google Play 이미지 등록 안내"
            />
          </li>
        </ul>
      </section>
      <h2>잘 안 될 때 확인해보세요</h2>
      <ul>
        <li>
          파일을 올릴 수 없다면 PNG, JPEG, WebP 중 하나로 다시 저장해주세요.
          HEIC, SVG, GIF 파일은 사용할 수 없습니다.
        </li>
        <li>
          앱 화면이 잘리면 선택한 기기와 비율이 비슷한 원본을 준비해주세요. 작은
          원본을 크게 늘리면 흐려질 수 있습니다.
        </li>
        <li>
          문구가 너무 작아지거나 잘리면 내용을 짧게 줄여보세요. 오류 안내가
          나타나면 안내에 따라 다시 시도해주세요.
        </li>
        <li>
          이미지가 많아 작업이 느려지면 몇 장씩 나눠 저장해보세요. 새로고침이
          필요하다면 완성된 이미지부터 다운로드해주세요.
        </li>
      </ul>
      <p>
        <Link to="/faq#download">다운로드 관련 질문</Link> ·{' '}
        <Link to="/guides/first-screenshot-workflow">
          처음 만드는 분을 위한 제작 순서
        </Link>
      </p>
      <ToolLink />
    </ContentLayout>
  );
}

export function PrivacyPage() {
  return (
    <main id="main-content" className="document-page shell">
      <span className="section-kicker">개인정보 안내</span>
      <h1>개인정보처리방침</h1>
      <p className="lead">
        Simple App Screen Baker를 이용할 때 어떤 정보가 처리되는지 안내합니다.
        최종 수정: 2026년 11월 5일
      </p>
      <h2>1. 편집에 사용하는 이미지와 문구</h2>
      <p>
        선택한 이미지, 프로젝트 이름, 제목과 부제목, 디자인 설정은 이미지 제작과
        다운로드를 위해 사용 중인 브라우저 안에서 처리합니다. 서비스는 이 자료를
        서버에 올리거나 보관하지 않으며, 별도의 회원가입 정보도 받지 않습니다.
      </p>
      <h2>2. 작업 내용이 남는 기간</h2>
      <p>
        편집 내용과 실행 취소 기록은 현재 작업 중인 탭에서만 유지됩니다.
        새로고침하거나 탭을 닫으면 사라지며, 나중에 복구할 수 없습니다. 기기에
        다운로드한 파일은 그대로 남으므로 삭제를 원하면 직접 지워주세요.
      </p>
      <h2>3. 사이트 접속 정보</h2>
      <p>
        사이트를 안정적으로 제공하고 비정상적인 접속을 막기 위해 서비스
        제공업체인 Cloudflare가 인터넷 주소(IP 주소), 접속 시간, 방문한 페이지,
        브라우저 정보 등을 처리할 수 있습니다. 이미지 편집 내용과는 별개이며,
        제공업체의 정보 처리에 관한 자세한 내용은{' '}
        <a href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare 개인정보처리방침
        </a>
        에서 확인할 수 있습니다.
      </p>
      <h2>4. 광고와 쿠키</h2>
      <p>
        이 사이트에는 Google AdSense 광고가 표시될 수 있습니다. Google과 광고
        제공업체는 광고 표시, 이용 실적 확인, 부정 이용 방지를 위해 방문한
        페이지, IP 주소, 쿠키 등의 정보를 사용할 수 있습니다. 쿠키는 방문 정보나
        설정을 기억하기 위해 브라우저에 남기는 작은 정보입니다. 광고 설정에 따라
        이전 방문 기록을 바탕으로 한 광고가 표시될 수 있습니다.
      </p>
      <p>
        개인 맞춤 광고는{' '}
        <a href="https://myadcenter.google.com/">Google 내 광고 센터</a>에서
        관리할 수 있습니다. 브라우저 설정에서 쿠키를 지우거나 차단할 수도
        있습니다. 개인 맞춤 광고를 꺼도 광고가 표시되거나 광고 측정·부정 이용
        방지를 위한 정보 처리가 이루어질 수 있습니다.
      </p>
      <p>
        자세한 내용은{' '}
        <a href="https://policies.google.com/technologies/partner-sites?hl=ko">
          Google의 파트너 사이트 정보 이용 안내
        </a>
        와{' '}
        <a href="https://policies.google.com/technologies/ads?hl=ko">
          Google 광고 및 개인정보 안내
        </a>
        를 확인해주세요. 광고를 보거나 클릭해야 이미지를 다운로드할 수 있는 것은
        아닙니다.
      </p>
      <h2>5. 문의할 때 보내는 정보</h2>
      <p>
        이메일로 문의하면 보내는 분의 이메일 주소와 문의 내용이 전달됩니다. 문의
        내용 확인과 답변에 필요한 정보만 보내주세요. 비밀번호, 결제 정보,
        공개하면 안 되는 원본 이미지는 포함하지 않도록 주의해주세요.
      </p>
      <h2>6. 개인정보 관련 요청과 문의</h2>
      <p>
        개인정보 열람, 정정, 삭제, 처리 정지 또는 동의 철회에 관한 요청은{' '}
        <a href="mailto:tlgns7386@gmail.com">tlgns7386@gmail.com</a>으로
        보내주세요. 요청 내용과 본인 여부를 확인한 뒤 처리 가능 여부와 결과를
        안내합니다. 브라우저에서만 처리하는 편집 자료는 서비스가 보관하지 않아
        대신 열람하거나 복구해드릴 수 없습니다.
      </p>
      <h2>7. 안내 내용의 변경</h2>
      <p>
        서비스나 정보 처리 방식이 바뀌면 이 페이지의 내용과 수정일을 갱신합니다.
        문의 사항이 있다면 위 이메일로 연락해주세요.
      </p>
    </main>
  );
}

export function TermsPage() {
  return (
    <main id="main-content" className="document-page shell">
      <span className="section-kicker">서비스 이용 안내</span>
      <h1>이용약관</h1>
      <p className="lead">
        Simple App Screen Baker의 이용 범위와 제작한 이미지의 사용 조건을
        안내합니다. 최종 수정: 2026년 11월 5일
      </p>
      <h2>1. 제공하는 서비스</h2>
      <p>
        Simple App Screen Baker는 앱 화면에 문구와 디자인을 더해 소개 이미지를
        만드는 무료 도구입니다. 회원가입이나 결제 없이 이용할 수 있으며, 완성한
        이미지는 PNG 한 장 또는 여러 장을 묶은 ZIP 파일로 저장할 수 있습니다.
        스토어에 이미지를 대신 등록하는 서비스는 제공하지 않습니다.
      </p>
      <h2>2. 사용할 수 있는 자료</h2>
      <p>
        직접 만든 자료나 사용할 권한이 있는 이미지와 문구를 사용해주세요. 다른
        사람의 저작권, 상표권, 초상권, 개인정보를 침해하는 자료나 불법적인
        내용은 사용할 수 없습니다. 서비스는 이용자가 선택한 자료의 소유권을
        요구하지 않습니다.
      </p>
      <h2>3. 완성한 이미지의 사용</h2>
      <p>
        사용 권한이 있는 자료로 만든 결과물은 앱 소개, 광고 등 상업적인 용도로도
        사용할 수 있습니다. 포함된 사진, 아이콘, 상표 등의 사용 조건은 직접
        확인해주세요. 제공되는 기기 테두리는 제조사의 공식 자료가 아닙니다.
      </p>
      <p>
        이 서비스는 Apple이나 Google의 공식 서비스가 아닙니다. 스토어에 등록하기
        전 이미지의 내용, 크기, 수량이 해당 스토어의 기준에 맞는지 확인해주세요.
        이미지 제작이 스토어 심사 통과를 보장하지는 않습니다.
      </p>
      <h2>4. 작업 내용과 다운로드</h2>
      <p>
        작업 내용은 자동 저장되지 않습니다. 새로고침하거나 탭을 닫으면
        사라지므로 필요한 결과물은 미리 다운로드해주세요. 기기와 브라우저의
        상태, 이미지의 크기와 수량에 따라 작업 속도가 달라지거나 저장에 실패할
        수 있습니다.
      </p>
      <h2>5. 이용 시 지켜주세요</h2>
      <p>
        다른 사람의 권리를 침해하는 이미지 제작, 불법적인 이용, 사이트 운영을
        방해하는 행위는 허용하지 않습니다. 서비스의 오류나 취약점을 악용하지
        말아주세요. 권리 침해나 오류를 발견하면 아래 연락처로 알려주세요.
      </p>
      <h2>6. 광고 안내</h2>
      <p>
        사이트에는 광고가 표시될 수 있습니다. 광고 시청이나 클릭은 이미지
        편집·다운로드의 조건이 아닙니다. 광고가 표시되지 않더라도 제작 도구를
        이용할 수 있습니다.
      </p>
      <h2>7. 서비스와 약관의 변경</h2>
      <p>
        기능, 지원하는 이미지 크기, 이용 조건은 서비스 운영 상황에 따라 바뀔 수
        있습니다. 중요한 변경이나 제공 중단이 예정된 경우 사이트에서 안내합니다.
        이용 조건의 변경 내용은 이 페이지에서 확인할 수 있습니다.
      </p>
      <h2>8. 문의</h2>
      <p>
        이용 중 불편한 점, 오류, 권리 침해에 관한 문의는{' '}
        <a href="mailto:tlgns7386@gmail.com">tlgns7386@gmail.com</a>으로
        보내주세요. 문제를 확인할 수 있는 설명과 브라우저 정보를 적어주시면
        도움이 됩니다. 민감한 개인정보나 사용 권한이 없는 자료는 보내지
        말아주세요.
      </p>
      <p>
        이 약관에 기재되지 않은 사항은 관련 법령에 따릅니다. 이 약관은 법령에서
        정한 이용자의 권리를 제한하지 않습니다.
      </p>
    </main>
  );
}

export function AboutPage() {
  return (
    <ContentLayout
      title="앱의 매력을 보여주는 가장 간단한 시작"
      description="Simple App Screen Baker는 앱 화면에 문구와 디자인을 더해 스토어 소개 이미지를 만드는 무료 도구입니다."
      kicker="서비스 소개"
    >
      <h2>앱 화면만 준비해오세요</h2>
      <p>
        어디에 무엇을 놓을지 처음부터 고민하지 않아도 괜찮습니다. 준비한 앱
        화면을 올리고, 마음에 드는 배치와 색상을 고른 뒤 소개 문구를 적어보세요.
        완성된 모습을 보면서 위치와 순서를 다듬을 수 있습니다.
      </p>
      <div className="content-card-grid">
        <section className="content-card">
          <h2>한 장부터 차근차근</h2>
          <p>
            첫 출시를 준비하거나 앱의 새로운 기능을 소개할 때 활용해보세요. 핵심
            화면 한 장으로 시작해 필요한 이미지를 이어서 만들 수 있습니다.
          </p>
        </section>
        <section className="content-card">
          <h2>여러 장도 같은 분위기로</h2>
          <p>
            배경과 글자 스타일을 함께 맞추고 화면과 문구만 바꿔보세요. 완성한
            이미지는 한 장씩 저장하거나 여러 장을 묶어서 받을 수 있습니다.
          </p>
        </section>
      </div>
      <h2>이런 작업을 할 수 있어요</h2>
      <ul>
        <li>앱 화면을 올려 여러 장의 소개 이미지 만들기</li>
        <li>문구와 앱 화면의 배치, 배경색과 글자 스타일 바꾸기</li>
        <li>휴대폰·태블릿·컴퓨터 모양의 테두리 선택하기</li>
        <li>미리보기에서 위치를 옮기고, 실수한 편집 되돌리기</li>
        <li>슬라이드를 복제하거나 순서를 바꾼 뒤 PNG·ZIP으로 저장하기</li>
      </ul>
      <h2>올릴 곳에 맞는 크기로</h2>
      <p>
        App Store와 Google Play에 사용할 여러 이미지 크기를 제공합니다. 등록할
        기기를 선택해 제작하고, 제출 전에는{' '}
        <Link to="/requirements">플랫폼 규격</Link>에서 필요한 크기와 수량을
        확인해주세요. 완성한 파일은 각 스토어에 직접 등록하면 됩니다.
      </p>
      <h2>가입 없이, 브라우저에서 바로</h2>
      <p>
        프로그램 설치나 회원가입 없이 무료로 이용할 수 있습니다. 편집에 사용하는
        이미지와 문구는 브라우저 안에서 처리하며 서비스 서버에 보관하지
        않습니다. 사이트 접속과 광고에 관한 안내는{' '}
        <Link to="/privacy">개인정보처리방침</Link>에서 확인해주세요.
      </p>
      <p className="document-callout">
        제작 도구는 컴퓨터의 넓은 화면에 맞춰져 있습니다. 작업은 자동 저장되지
        않으니 새로고침하거나 탭을 닫기 전에 완성한 이미지를 꼭
        다운로드해주세요.
      </p>
      <p>
        처음이라면 <Link to="/guide">사용 가이드</Link>를 따라 시작해보세요.
        이미지 구성과 문구가 고민될 때는 <Link to="/guides">제작 팁</Link>을
        참고할 수 있습니다.
      </p>
      <ToolLink />
    </ContentLayout>
  );
}
