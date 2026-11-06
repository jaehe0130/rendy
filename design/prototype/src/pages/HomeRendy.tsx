import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, SCHOOLS, lowest, productById, won } from '../data'
import { ProductCard, ProductArt } from '../components'
import { useStore, dday } from '../store'
import '../rendy-home.css'

// 렌디 메인 (집업 스타일: 가운데 큰 제목 + 앱 화면 목업 + 해시태그 혜택 카드 + 신뢰 + 후기 + FAQ)

const FAQ: [string, string][] = [
  ['보증금은 정말 없나요?', '네. 결제 카드만 등록해요. 파손은 렌터카 자차처럼 보장 단계를 골라요. 기본(월 0원, 수리비 100%) · 안심(월 대여료의 5%, 수리비 30%) · 완전 안심(월 대여료의 10%, 0%). 2cm 이하 생활 마모는 어떤 단계든 0원이에요.'],
  ['최소 얼마나 빌려야 하나요?', '2개월부터 1개월 단위로 연장해요. 반납 2주 전부터는 1주 단위로 최대 3주까지 더 쓸 수 있어요.'],
  ['일찍 반납하면 환불되나요?', '처음 고른 기간이 약정이라 환불은 없어요. 대신 언제든 연장하거나 다른 가전으로 교체할 수 있어요.'],
  ['배송비는 얼마예요?', '주 2회 정해진 요일(화·금)에 배송·회수해요. 한 번에 결제하는 월 렌탈료가 3만원 이상이면 무료, 미만이면 1만원이에요.'],
  ['흠집이 생기면 어떻게 판정해요?', '출고 때 찍은 사진과 반납 사진을 AI가 비교해 새로 생긴 흠집만 표시하고 길이를 재요. 최종 판정은 운영자가 작동 테스트와 함께 하고, 48시간 안에 이의 신청할 수 있어요.'],
  ['쓰던 가전은 얼마에 팔 수 있어요?', '구매 2년 이내 제품이면 공식몰가의 25~30%예요. 렌디에서 빌려 쓴 적이 있으면 5%p 더 드려요. 수거는 무료, 검수 끝나면 바로 입금해요.'],
]

const REVIEWS: [string, string, string][] = [
  ['장마 4개월만 빌렸는데 살 뻔한 돈 30만 원 아꼈어요. 반납도 문 앞에서 끝.', '돈암동 · 자취 2년차', '제습기 10L'],
  ['받은 날 사진 찍으니까 "출고 때와 같아요"가 바로 떠서 안심됐어요.', '안암동 · 고려대', '미니 건조기'],
  ['졸업하면서 건조기를 팔았는데, 사진 3장으로 견적 받고 가져간 날 바로 입금됐어요.', '정릉동 · 국민대', '팔기'],
  ['학교 인증하니까 첫 달 반값에 배송비도 무료라 부담 없었어요.', '동선동 · 성신여대', '음식물 처리기'],
]

function PhoneHome() {
  const { rentals } = useStore()
  const r = rentals.find((x) => x.status === '사용 중')
  const p = r ? productById(r.productId) : productById('dehumidifier-10')
  const d = r ? dday(r.end) : 12
  return (
    <div className="rd-phone rd-phone-front" aria-hidden>
      <div className="rd-notch" />
      <div className="rd-screen">
        <div className="row between" style={{ fontSize: 10, fontWeight: 700, padding: '2px 4px 8px' }}><span>18:35</span><span>●●● ▮</span></div>
        <b style={{ fontSize: 15, letterSpacing: '-.02em' }}>Rendy</b>
        <div className="rd-notice">📢 11월 학교 인증 이벤트 · 첫 달 50%</div>
        <div className="rd-hero-card">
          <span style={{ fontSize: 10, opacity: .85 }}>내 렌탈</span>
          <b style={{ fontSize: 15, lineHeight: 1.35 }}>{p?.name} 반납까지<br />D-{Math.max(0, d)} 남았어요</b>
          <span style={{ fontSize: 10, opacity: .85 }}>반납 없이 연장하면 배송비 0원</span>
          <div className="rd-pill"><span>1개월 연장하기</span><span>›</span></div>
        </div>
        <div className="row between" style={{ marginTop: 12 }}><b style={{ fontSize: 12 }}>렌디가 주는 혜택</b><span style={{ fontSize: 10, color: 'var(--ink-3)' }}>전체보기 ›</span></div>
        <div className="row gap-4" style={{ margin: '6px 0' }}>{['전체', '학생', '연장', '이사'].map((x, i) => <span key={x} className={`rd-mini-chip ${i === 0 ? 'on' : ''}`}>{x}</span>)}</div>
        <div className="row gap-8">
          {[['첫 렌탈 첫 달', '50% 할인'], ['배송비', '1회 무료']].map(([a, b]) => (
            <div key={a} className="rd-coupon"><span>{a}</span><b>{b}</b><small>학교 인증 회원</small></div>
          ))}
        </div>
        <div className="rd-tabbar"><span className="on">홈</span><span>빌리기</span><span>AI 상담</span><span>내 렌탈</span></div>
      </div>
    </div>
  )
}

function PhoneCheck() {
  return (
    <div className="rd-phone rd-phone-back" aria-hidden>
      <div className="rd-notch" />
      <div className="rd-screen">
        <div className="row between" style={{ fontSize: 10, fontWeight: 700, padding: '2px 4px 8px' }}><span>18:35</span><span>●●● ▮</span></div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>반납 · AI 예비 판정</div>
        <b style={{ fontSize: 15, lineHeight: 1.35 }}>새로 생긴 흠집을<br />확인했어요</b>
        <div className="row gap-4" style={{ margin: '10px 0' }}>
          {['출고', '받은 날', '반납'].map((x, i) => <div key={x} className="rd-thumb">{i === 2 && <i />}<span>{x}</span></div>)}
        </div>
        <div className="rd-result">
          <span className="rd-ai">AI</span>
          <div className="stack"><small>옆면 긁힘 1.6cm · 생활 마모</small><b>예상 부담 0원</b></div>
        </div>
        <div className="rd-kv"><span>상태 점수</span><b>92 → 88</b></div>
        <div className="rd-kv"><span>보장 단계</span><b>완전 안심</b></div>
        <div className="rd-kv"><span>최종 판정</span><b>운영자 확인 후</b></div>
      </div>
    </div>
  )
}

export default function HomeRendy() {
  const { user, schoolCounts } = useStore()
  const [open, setOpen] = useState(0)
  const best = PRODUCTS.slice(0, 4)
  return (
    <div className="rd">
      {/* 1. 히어로 */}
      <section className="rd-hero">
        <h1 className="rd-h1">{user ? <>{user.name} 님,<br />가전은 렌디로 바로</> : <>필요한 가전<br />빌리면 바로 렌디</>}</h1>
        <p className="rd-sub">세척·점검 끝난 가전을 2개월부터. 보증금 없이, 주 2회 문 앞까지.</p>
        <div className="row gap-12" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn">가전 보러 가기</Link>
          <Link to="/quiz" className="btn line">1분 진단</Link>
          <Link to="/try" className="btn line">AI 흠집 찾기 체험</Link>
        </div>
        <div className="rd-phones"><PhoneCheck /><PhoneHome /></div>
      </section>

      {/* 2. 한 문장 */}
      <section className="rd-statement">
        <p>사기엔 아깝고<br />안 쓰기엔 불편했던 가전</p>
        <span>성북구 자취생 39명 중 35명이 겪은 고민이에요</span>
      </section>

      {/* 3. 가장 쉬운 방법 */}
      <section className="rd-section">
        <h2 className="rd-h2">가전을 빌리는<br />가장 쉬운 방법</h2>
        <div className="rd-steps">
          {[['01', '고르고', 'AI 상담이나 1분 진단으로 필요한 가전만. 신청 전에 총비용을 보여드려요.'], ['02', '받고', '주 2회 지정일에 문 앞으로. 받은 날 사진 3장으로 상태를 같이 확인해요.'], ['03', '쓰고', '반납 없이 연장하면 배송비 0원. 계절이 바뀌면 다른 가전으로 교체.'], ['04', '돌려줘요', 'AI가 출고 사진과 비교해 새 흠집만 찾아요. 생활 마모는 0원.']].map(([n, a, b]) => (
            <div key={n} className="rd-step"><span className="rd-step-n">{n}</span><b>{a}</b><p>{b}</p></div>
          ))}
        </div>
      </section>

      {/* 4. 혜택 카드 (해시태그) */}
      <section className="rd-section rd-soft">
        <h2 className="rd-h2">렌디라서 받는 혜택</h2>
        <div className="rd-grid">
          {[
            ['학교 인증하면 첫 달 50%', '성북구 7개 대학 학생이면 첫 렌탈 첫 달 반값, 배송비 1회 무료, 친구 초대 5,000원까지.', ['#첫달50%', '#배송비무료', '#친구초대'], '/school'],
            ['AI가 보는 흠집, 0원인 생활 마모', '출고·반납 사진을 AI가 비교해 새 흠집만 찾고 길이를 재요. 2cm 이하는 0원.', ['#출고사진비교', '#생활마모0원', '#운영자최종판정'], '/my'],
            ['렌터카처럼 고르는 파손 보장', '기본 0원 · 안심 월 대여료의 5% · 완전 안심 10%. 내 상황에 맞게 골라요.', ['#기본', '#안심', '#완전안심'], '/products'],
            ['떠날 땐 렌디가 사 갈게요', '이사·졸업할 때 사진 3장 올리면 예상 매입가를 바로 알려드려요. 무료로 가져가고 검수 끝나면 바로 입금해요. 렌디 이용자는 +5%p.', ['#바이백', '#무료수거', '#바로입금'], '/sell'],
          ].map(([t, d, tags, to]) => (
            <Link key={t as string} to={to as string} className="rd-card">
              <b>{t as string}</b><p>{d as string}</p>
              <div className="rd-tags">{(tags as string[]).map((x) => <span key={x}>{x}</span>)}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. 인기 가전 */}
      <section className="rd-section">
        <div className="row between wrap-row" style={{ alignItems: 'flex-end', marginBottom: 24 }}>
          <h2 className="rd-h2" style={{ textAlign: 'left', margin: 0 }}>이번 달 많이 빌린 가전</h2>
          <Link to="/products" className="link">전체 보기 ›</Link>
        </div>
        <div className="grid g4">{best.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {/* 6. 신뢰 */}
      <section className="rd-section rd-trust">
        <h2 className="rd-h2" style={{ color: '#fff' }}>기록으로 믿을 수 있는 렌탈</h2>
        <p className="rd-sub" style={{ color: 'rgba(255,255,255,.75)' }}>기기마다 QR로 세척일 · 점검 결과 · 기존 흠집을 공개해요</p>
        <div className="rd-trust-row">
          {[['기기 이력 QR', '실제 사진 · 세척일 · 수리 이력'], ['AI 상태 점수', '흠집 위치·길이로 0~100점'], ['운영자 최종 판정', '48시간 이의 신청 · 3영업일 재판정']].map(([a, b]) => (
            <div key={a} className="rd-trust-item"><b>{a}</b><span>{b}</span></div>
          ))}
        </div>
      </section>

      {/* 7. 학교 */}
      <section className="rd-section">
        <h2 className="rd-h2">성북구 7개 대학이 함께 채우는 중</h2>
        <div className="rd-schools">
          {SCHOOLS.map((s) => <div key={s.name} className="rd-school"><b>{s.name}</b><span>{schoolCounts[s.name] ?? s.count}명 인증</span></div>)}
        </div>
      </section>

      {/* 8. 후기 */}
      <section className="rd-section rd-soft">
        <h2 className="rd-h2">렌디 이용 후기</h2>
        <div className="rd-reviews">
          {REVIEWS.map(([q, who, item]) => (
            <div key={q} className="rd-review"><span className="rd-review-item">{item}</span><p>“{q}”</p><small>{who}</small></div>
          ))}
        </div>
        <p className="faint" style={{ textAlign: 'center', fontSize: 12, marginTop: 16 }}>후기는 프로토타입 예시예요</p>
      </section>

      {/* 9. 가격 한눈에 */}
      <section className="rd-section">
        <h2 className="rd-h2">월 요금 한눈에</h2>
        <div className="rd-price-row">
          {PRODUCTS.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="rd-price">
              <div style={{ background: p.bg }}><ProductArt p={p} size={72} /></div>
              <b>{p.name}</b><span>월 {won(lowest(p))}~</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="rd-section rd-soft">
        <h2 className="rd-h2">자주 묻는 질문<br />여기서 확인하세요</h2>
        <div className="rd-faq">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`rd-faq-item ${open === i ? 'on' : ''}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}><span>Q. {q}</span><span>{open === i ? '−' : '+'}</span></button>
              {open === i && <p>{a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
