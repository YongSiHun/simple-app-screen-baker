import { Link } from 'react-router';
import { GOOGLE_SOURCE } from '../../export/constants/presets';
import { WORKFLOW } from '../data/workflow';
import { APPLE_UPLOAD_SOURCE } from '../data/requirements';
import { ContentLayout, InfoLink, ToolLink } from '../components/ContentLayout';
/**
 * 스크린샷 제작과 다운로드 방법을 안내합니다.
 */
export function GuidePage() {
  return (
    <ContentLayout
      title="처음부터 제출까지, 스크린샷 사용 가이드"
      description="실제 앱 화면을 준비해 편집하고 PNG로 저장한 뒤 스토어에 등록하는 일곱 단계입니다."
      kicker="THE SCREEN BAKER HANDBOOK"
    >
      <p className="document-callout">
        편집기는 데스크톱 작업영역(최소 1280 × 800px)을 사용하며 작은 화면에서는
        스크롤이 필요합니다. 작업은 현재 탭에만 유지됩니다. 새로고침 전에
        결과물을 다운로드하세요.
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
                <strong>확인할 점</strong> {step.check}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <section className="document-callout">
        <h2>등록 전에는 최신 규격을 확인하세요</h2>
        <p>
          공식 규격과 서비스의 출력 크기는{' '}
          <Link to="/requirements">플랫폼별 규격</Link>에서 비교할 수 있습니다.
          실제 스토어 화면의 항목 이름과 제출 절차는 변경될 수 있습니다.
        </p>
        <ul>
          <li>
            <InfoLink
              href={APPLE_UPLOAD_SOURCE}
              label="Apple: 앱 버전별 스크린샷 등록"
            />
          </li>
          <li>
            <InfoLink
              href={GOOGLE_SOURCE}
              label="Google Play: 등록정보의 미리보기 자료 관리"
            />
          </li>
        </ul>
      </section>
      <h2>업로드·미리보기·다운로드 문제 해결</h2>
      <ul>
        <li>
          손상되거나 지원하지 않는 파일은 PNG·JPEG·WebP로 다시 저장하세요.
          HEIC·SVG·GIF는 지원하지 않습니다.
        </li>
        <li>
          화면 일부가 잘리면 해당 기기 비율의 원본을 준비하세요. 자동 배치는
          원본 비율을 유지하며 기기 화면을 채웁니다.
        </li>
        <li>
          긴 문구 오류는 수식어를 줄여 해결해보세요. 폰트 로딩 또는 생성 오류가
          표시되면 먼저 해당 안내를 확인하세요.
        </li>
        <li>
          이미지 메모리가 부족하면 슬라이드 수를 줄여보세요. 새로고침이
          필요하다면 가능한 결과물부터 다운로드하세요.
        </li>
      </ul>
      <p>
        <Link to="/faq#download">다운로드 FAQ</Link> ·{' '}
        <Link to="/guides/first-screenshot-workflow">
          첫 제작을 위한 계획 세우기
        </Link>
      </p>
      <ToolLink />
    </ContentLayout>
  );
}

/**
 * 브라우저 이미지 처리와 데이터 보관 방식을 안내합니다.
 */
export function PrivacyPage() {
  return (
    <main id="main-content" className="document-page shell">
      <span className="section-kicker">PRIVACY</span>
      <h1>개인정보처리방침</h1>
      <p className="lead">
        개정안 작성일: 2026년 11월 4일. TODO: 운영자가 적용일과 아래 미확정
        정보를 확인해야 합니다.
      </p>
      <h2>이미지와 편집 정보의 처리 목적·항목</h2>
      <p>
        선택한 PNG·JPEG·WebP 파일, 프로젝트명, 문구와 디자인 설정은 스크린샷
        합성과 다운로드를 위해 현재 브라우저 탭의 메모리에서 처리합니다. 앱
        코드에는 이미지나 편집 상태를 외부 서버로 업로드하거나 서버에 저장하는
        기능이 없습니다. Canvas로 PNG를 생성하고 JSZip으로 ZIP을 만든 뒤 임시
        Blob URL과 브라우저 다운로드 기능으로 저장합니다.
      </p>
      <h2>보관 기간과 삭제</h2>
      <p>
        자체 회원 계정·데이터베이스·프로젝트 저장 기능은 없으며, 편집 내용을
        쿠키·localStorage·sessionStorage·IndexedDB에 저장하지 않습니다. 원본은
        현재 프로젝트와 실행 취소·다시 실행 이력에서 참조하는 동안 유지될 수
        있습니다. 참조가 끝나면 비트맵과 임시 URL을 해제합니다. 새로고침 또는 탭
        종료 시 작업 내용이 사라집니다. 다운로드 파일은 기기에 남으므로 이용자가
        직접 삭제해야 합니다.
      </p>
      <h2>제3자 제공 및 외부 스크립트</h2>
      <p>
        앱의 이미지 처리·내보내기 코드에는 이용자의 이미지를 제3자에게 전송하는
        기능이 없습니다. 다만 광고 스크립트는 페이지에서 실행되는 제3자
        코드이며, 사이트 전체에서 외부 통신이 없다는 의미는 아닙니다. 계정
        로그인이나 이미지 공유 기능은 제공하지 않습니다.
      </p>
      <h2>Google AdSense와 쿠키</h2>
      <p>
        프로덕션 빌드에는 Google AdSense 자동 광고 코드(게시자 ID:
        ca-pub-7225723390864149)가 포함됩니다. Google 및 제3자 광고 제공업체는
        쿠키, 웹 비콘, IP 주소 등 관련 기술과 정보를 사용하여 광고 제공, 개인화,
        빈도 관리, 측정 및 부정 트래픽 방지를 수행할 수 있습니다. 이전 방문
        기록에 따라 광고가 제공될 수 있으며, 광고 제공 여부와 무관하게 이미지
        다운로드를 이용할 수 있습니다.
      </p>
      <p>
        <a href="https://policies.google.com/technologies/partner-sites">
          Google 파트너 사이트에서의 데이터 이용
        </a>{' '}
        및{' '}
        <a href="https://policies.google.com/technologies/ads">
          광고 기술 안내
        </a>
        를 확인하세요. 개인 맞춤 광고 설정은{' '}
        <a href="https://myadcenter.google.com/">Google 내 광고 센터</a>에서
        관리할 수 있고, 다른 제공업체의 설정은{' '}
        <a href="https://www.aboutads.info/choices/">광고 선택 안내</a>를 참고할
        수 있습니다. 브라우저에서 쿠키 삭제·차단도 가능합니다. 이 설정이 모든
        정보 처리를 중단한다는 의미는 아닙니다.
      </p>
      <h2>지역별 동의 관리</h2>
      <p>
        EEA·영국·스위스 등에 광고를 제공할 때에는 필요한 고지 및 동의를 검토해야
        하며, 개인 맞춤 광고에는 Google 인증 CMP와 IAB TCF 연동이 요구됩니다.
        쿠키 안내 문구만으로 동의를 받은 것으로 보지 않습니다. TODO: 운영자가
        AdSense 개인정보 보호 및 메시지에서 인증 CMP를 설정하고 동의·거부·철회
        경로와 적용 지역을 검증해야 합니다. 이 코드 변경만으로 CMP가
        활성화되지는 않습니다.
      </p>
      <h2>접속 로그와 호스팅</h2>
      <p>
        폰트와 앱 정적 파일은 사이트와 함께 제공합니다. 자체 분석 도구는
        추가하지 않았습니다. Cloudflare는 사이트 제공 및 보안을 위해 IP 주소,
        접속 시간, 요청 URL, 브라우저 등 기술적 정보를 처리할 수 있습니다.{' '}
        <a href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare 개인정보 안내
        </a>
        를 참고하세요.
      </p>
      <p>
        TODO: 실제 Cloudflare 로그·분석 설정, 수집 항목·목적·보유 기간·삭제
        방식, 처리 위탁·제3자 제공 구분과 수탁자, Google 광고 공급업체, 국외
        이전의 수령자·국가·시기·방법·항목·목적·기간 및 법적 근거·거부 방법을
        확인해 기재해야 합니다. 확인되지 않은 보유 기간이나 보안 조치를 보장하지
        않습니다.
      </p>
      <h2>이용자 권리와 문의</h2>
      <p>
        편집 데이터는 탭 종료·새로고침으로 지울 수 있습니다. 접속 정보 등
        운영자가 처리하는 개인정보의 열람·정정·삭제·처리 정지와 동의 철회 문의는
        기존 사이트 연락처{' '}
        <a href="mailto:tlgns7386@gmail.com">tlgns7386@gmail.com</a>로 보낼 수
        있습니다. TODO: 운영자·개인정보 보호책임자의 성명 또는 명칭, 담당 부서와
        연락처의 유효성, 권리 행사 및 고충 처리 절차, 법정 보유 의무와 안전성
        확보 조치, 변경 공지 방법을 확인해야 합니다.
      </p>
    </main>
  );
}

/**
 * 서비스 제공 범위와 이용 조건을 안내합니다.
 */
export function TermsPage() {
  return (
    <main id="main-content" className="document-page shell">
      <span className="section-kicker">TERMS OF USE</span>
      <h1>이용약관</h1>
      <p className="lead">
        개정안 작성일: 2026년 11월 4일 · TODO: 실제 적용일 확인
      </p>
      <h2>서비스 범위</h2>
      <p>
        Simple App Screen Baker는 브라우저에서 앱 스크린샷과 문구를 합성하고 PNG
        또는 ZIP으로 다운로드하는 무료 도구입니다. 회원가입, 결제, 클라우드
        보관, 앱스토어 제출 대행은 제공하지 않습니다.
      </p>
      <h2>업로드 자료에 대한 권리</h2>
      <p>
        이용자는 사용할 이미지, 문구, 상표 등에 필요한 권리를 확보해야 합니다.
        본 도구는 업로드 자료에 대한 소유권을 요구하지 않습니다. 타인의 권리를
        침해하거나 불법적인 콘텐츠를 제작하는 데 사용해서는 안 됩니다.
      </p>
      <h2>생성 결과물</h2>
      <p>
        이용자는 자신이 권리를 가진 자료로 생성한 결과물을 앱 소개와 상업적
        목적으로 사용할 수 있습니다. 본 도구의 범용 프레임은 제조사 공식 에셋이
        아닙니다. 결과물의 정확성, 원본 자료의 권리, 스토어 정책 및 제출 규격
        준수 여부는 제출 전에 이용자가 확인해야 합니다.
      </p>
      <h2>작업 내용과 서비스 변경</h2>
      <p>
        작업 내용은 현재 탭에서만 유지됩니다. 필요한 파일은 탭을 닫거나
        새로고침하기 전에 다운로드해야 합니다. 브라우저·기기 성능에 따라 처리
        속도와 생성 가능 이미지 수가 달라질 수 있습니다. 서비스 기능 및 지원
        규격은 변경되거나 중단될 수 있습니다.
      </p>
      <h2>이용 제한과 문의</h2>
      <p>
        저작권·상표권·개인정보 등 타인의 권리를 침해하는 자료, 불법 콘텐츠 제작,
        서비스 운영 방해를 위한 이용은 허용하지 않습니다. 이 도구에는 업로드
        자료를 서버에서 수집·검수하거나 사용자 계정을 정지하는 기능이 없습니다.
        권리 침해나 오류 문의는 기존 사이트 연락처{' '}
        <a href="mailto:tlgns7386@gmail.com">tlgns7386@gmail.com</a>로
        보내주세요. 민감한 원본 이미지나 개인정보는 문의에 포함하지 마세요.
      </p>
      <h2>광고와 다운로드</h2>
      <p>
        서비스에는 Google 자동 광고가 표시될 수 있습니다. 광고 시청·클릭은
        다운로드 조건이 아니며 광고 로딩을 기다리지 않습니다. 광고 차단 또는
        로딩 실패 시에도 편집·다운로드 기능을 제공합니다.
      </p>
      <h2>운영 정책 확인</h2>
      <p>
        TODO: 운영자 명칭·연락처, 변경·중단 시 공지 방법, 이용 제한의
        기준·절차와 이의 제기 방법을 확정해야 합니다. 법률 검토 필요:
        저작권·개인정보 관련 책임, 약관 변경·고지 및 소비자 권리 관련 조항을
        실제 운영 정책과 대한민국 관계 법령에 맞춰 검토하세요.
      </p>
      <h2>제공 한계</h2>
      <p>
        이 도구는 특정 스토어의 심사 통과, 모든 브라우저에서의 동일한 동작, 작업
        내용의 영구 보관을 보장하지 않습니다. 이 약관은 관련 법령에 따른
        이용자의 권리를 배제하려는 것이 아닙니다. 공개 서비스 운영 전 실제
        운영자 정보와 적용 조건을 검토하여 보완해야 합니다.
      </p>
    </main>
  );
}

/** 서비스 목적과 실제 제공 범위를 소개합니다. */
export function AboutPage() {
  return (
    <ContentLayout
      title="앱 화면을 스토어 소개 이미지로"
      description="Simple App Screen Baker는 개인 개발자와 소규모 팀이 실제 앱 화면에 문구와 디자인을 더해 제출용 이미지를 준비하는 무료 웹 도구입니다."
      kicker="ABOUT SCREEN BAKER"
    >
      <h2>한 장을 완성하는 데 필요한 설정을 모았습니다</h2>
      <p>
        빈 캔버스에 요소를 하나씩 배치하기보다, 출력 프리셋과 템플릿을 고르고 앱
        화면을 올리는 흐름으로 시작합니다. 스마트폰·태블릿·PC 프레임과 문구
        배치를 미리보기에서 조절할 수 있어 반복되는 스크린샷 구성을 준비할 때
        사용할 수 있습니다.
      </p>
      <div className="content-card-grid">
        <section className="content-card">
          <h2>개인 개발자에게</h2>
          <p>
            한 앱의 핵심 기능을 슬라이드별로 설명하고, 프로젝트 공통 템플릿과
            색을 사용해 일관된 소개 이미지를 준비하세요.
          </p>
        </section>
        <section className="content-card">
          <h2>작은 개발팀에게</h2>
          <p>
            출력 기기별 PNG와 ZIP을 내려받아 팀의 검토·등록 과정에 활용할 수
            있습니다. 실시간 공동 편집이나 클라우드 공유 기능은 제공하지
            않습니다.
          </p>
        </section>
      </div>
      <h2>현재 제공하는 기능</h2>
      <ul>
        <li>PNG·JPEG·WebP 원본 업로드와 복수 슬라이드 구성</li>
        <li>
          Top Headline·Centered Device·Frameless 템플릿, 배경·글자색·굵기·기기
          프레임 설정
        </li>
        <li>제목·부제목 입력, 미리보기에서 위치 조정, 실행 취소·다시 실행</li>
        <li>슬라이드 추가·복제·순서 변경과 PNG·ZIP 다운로드</li>
      </ul>
      <h2>스토어별 프리셋으로 준비하세요</h2>
      <p>
        App Store의 iPhone·iPad, Mac App Store와 Google Play의 Phone·Tablet
        Landscape·Chromebook 프리셋을 제공합니다. 현재 구현된 크기와 공식 스토어
        요건의 차이는 <Link to="/requirements">규격 안내</Link>에서 확인하세요.
        스토어에 직접 등록하는 단계는{' '}
        <Link to="/guide#submission">사용 가이드</Link>에서 안내합니다.
      </p>
      <h2>브라우저 안에서 제작하고 기기에 저장합니다</h2>
      <p>
        앱의 이미지 처리 코드는 선택한 원본과 편집 상태를 현재 탭의 메모리에서
        다룹니다. PNG는 현재 슬라이드, ZIP은 현재 출력 기기의 전체 슬라이드를
        저장합니다. 회원가입·결제·프로젝트 영구 저장·자동 스토어 제출은 제공하지
        않습니다. 자세한 정보 처리는 <Link to="/privacy">개인정보처리방침</Link>
        을 확인하세요.
      </p>
      <p>
        편집기는 최소 1280 × 800px의 데스크톱 작업영역을 사용합니다. 작은
        화면에서는 스크롤이 필요하며, 안내 콘텐츠는 모바일에서도 읽을 수
        있습니다. Apple·Google의 공식 서비스가 아니며 제출 결과를 보장하지
        않습니다. 이미지와 문구의 사용 권리는 이용자가 확인해야 합니다.
      </p>
      <p>
        <Link to="/faq">자주 묻는 질문</Link> ·{' '}
        <Link to="/guides">스크린샷 제작 팁</Link>
      </p>
      <ToolLink />
    </ContentLayout>
  );
}
