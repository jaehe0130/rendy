import { lazy, Suspense, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRICING, PRODUCTS, SCHOOLS, bundleSaving, gradeFor, lowest, productById, won } from '../data'
import { ProductCard, ProductArt } from '../components'
import { useStore, dday } from '../store'
import '../rendy-home.css'

// 3D(model-viewer)는 무거워서 따로 나눠 불러옴 (첫 화면 글자가 먼저 뜨게)
const Home3D = lazy(() => import('./Home3D'))

// 렌디 메인 (집업 스타일: 가운데 큰 제목 + 앱 화면 목업 + 해시태그 혜택 카드 + 신뢰 + 후기 + FAQ)

const FAQ: [string, string][] = [
  ['보증금은 정말 없나요?', '네. 결제 카드만 등록해요. 파손이 걱정되면 파손 케어를 고를 수 있어요. 베이직(월 공식몰가의 0.5%, 수리비 50%) · 프리미엄(월 0.8%, 수리비 20%). 2cm 이하 생활 마모는 케어 없이도 0원이에요.'],
  ['최소 얼마나 빌려야 하나요?', '2개월부터 빌릴 수 있고, 1개월 단위로 연장해요.'],
  ['일찍 반납하면 환불되나요?', '처음 고른 기간이 약정이라 환불은 없어요. 대신 언제든 연장하거나 다른 가전으로 교체할 수 있어요.'],
  ['배송비는 얼마예요?', '주 2회 정해진 요일(화·금)에 배송·회수해요. 한 번에 결제하는 월 렌탈료가 3만원 이상이면 무료, 미만이면 1만원이에요. 그래서 여러 개를 꾸러미로 같이 빌리면 따로 빌릴 때보다 배송비만큼 싸요.'],
  ['할인은 어떤 게 있어요?', '성북구 7개 대학 학생이면 학교 인증으로 첫 렌탈 첫 달 50%(최대 1만 원)와 배송비 1회 무료를 받아요. 친구를 초대하면 둘 다 5,000원, 꾸러미로 월 3만원 이상 빌리면 배송·회수가 0원이에요.'],
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
        <div className="rd-tabbar"><span className="on">홈</span><span>빌리기</span><span>AI 살림 상담</span><span>내 렌탈</span></div>
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
        <div className="rd-kv"><span>파손 케어</span><b>프리미엄</b></div>
        <div className="rd-kv"><span>최종 판정</span><b>운영자 확인 후</b></div>
      </div>
    </div>
  )
}

// 내 방에 맞는 가전: 방 크기를 고르면 그 방에 맞는 꾸러미 (data.ts 상품 specs의 방 크기 기준)
const ROOMS: { key: string; label: string; note: string; items: string[] }[] = [
  { key: 's', label: '원룸 5평 이하', note: '빨래 널 자리도 없는 좁은 방', items: ['mini-dryer', 'dehumidifier-10'] },
  { key: 'm', label: '원룸 6~8평', note: '습기 · 건조 · 음식물 냄새까지 챙기는 방', items: ['dehumidifier-10', 'humidifier', 'foodwaste'] },
  { key: 'l', label: '투룸 · 셰어하우스', note: '넓은 방, 빨래 많은 집', items: ['dehumidifier-16', 'mini-dryer', 'foodwaste'] },
]

function RoomPicker() {
  const [room, setRoom] = useState(ROOMS[0].key)
  const r = ROOMS.find((x) => x.key === room)!
  const nav = useNavigate()
  const { addToCart } = useStore()
  const ok = r.items.map((id) => productById(id)!).filter((p) => p.stock > 0)
  const sum = ok.reduce((a, p) => a + lowest(p), 0)
  const save = bundleSaving(ok.map(lowest)).saved
  return (
    <section id="room" className="rd-section">
      <h2 className="rd-h2">내 방에 맞는 가전만<br />골라서 빌려요</h2>
      <div className="chips" style={{ justifyContent: 'center', marginBottom: 12 }}>
        {ROOMS.map((x) => <button key={x.key} className={`chip ${room === x.key ? 'on' : ''}`} onClick={() => setRoom(x.key)}>{x.label}</button>)}
      </div>
      <p className="muted" style={{ textAlign: 'center', marginBottom: 28 }}>{r.note}에 맞춘 꾸러미예요</p>
      <div className="grid g3 rd-room-grid">{r.items.map((id) => <ProductCard key={id} p={productById(id)!} />)}</div>
      <div className="rd-room-sum">
        <div className="stack gap-4">
          <b>지금 빌릴 수 있는 {ok.length}개 · 월 {won(sum)}</b>
          <span>{save > 0 ? `꾸러미로 빌리면 따로 빌릴 때보다 배송·회수 ${won(save)} 아껴요` : `월 ${won(PRICING.freeOver)} 이상 꾸러미면 배송·회수 0원`} · 학교 인증하면 첫 달 50%</span>
        </div>
        <div className="row gap-8 wrap-row">
          <button className="btn" onClick={() => { ok.forEach((p) => addToCart({ productId: p.id, mode: 'long', grade: gradeFor(p, 'value'), months: 4, weeks: 1, plan: 'full' })); nav('/checkout') }}>이 꾸러미로 빌리기</button>
          <Link to={`/room?room=${room === 's' ? 's' : 'm'}&items=${r.items.join(',')}`} className="btn line">3D로 내 방에 놓아 보기</Link>
          <Link to="/ai" className="btn line">AI 살림 상담으로 더 맞추기</Link>
        </div>
      </div>
    </section>
  )
}

export default function HomeRendy() {
  const { schoolCounts } = useStore()
  const [open, setOpen] = useState(0)
  const best = PRODUCTS.slice(0, 4)
  return (
    <div className="rd">
      {/* 1. 히어로: 내 방에 맞는 가전 + 할인 */}
      <section className="rd-hero">
        <span className="rd-eyebrow">성북구 1인 가구 생활가전 렌탈</span>
        <h1 className="rd-h1">내 방에 맞는 가전,<br />사지 말고 렌디로</h1>
        <p className="rd-sub">원룸 크기와 고민에 맞는 가전만 골라 2개월부터 빌려요.<br className="hide-sm" /> 세척·점검 끝난 기기를 보증금 없이, 주 2회 문 앞까지.</p>
        <div className="rd-deals">
          <span><b>첫 달 50%</b>학교 인증 회원</span>
          <span><b>배송비 0원</b>꾸러미 월 3만원 이상</span>
          <span><b>5,000원</b>친구 초대 할인</span>
        </div>
        <div className="row gap-12" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#room" className="btn" onClick={(e) => { e.preventDefault(); document.getElementById('room')?.scrollIntoView({ behavior: 'smooth' }) }}>내 방에 맞는 가전 찾기</a>
          <Link to="/products" className="btn line">전체 가전 보기</Link>
          <Link to="/try" className="btn line">AI 반납 판정 체험</Link>
        </div>
        <div className="rd-hero-3d">
          <Suspense fallback={<div className="rd-3d-wait">3D 불러오는 중…</div>}><Home3D /></Suspense>
        </div>
      </section>

      <RoomPicker />

      {/* 2. 한 문장 */}
      <section className="rd-statement">
        <p>사기엔 아깝고<br />안 쓰기엔 불편했던 가전</p>
        <span>성북구 자취생 39명 중 35명이 겪은 고민이에요</span>
      </section>

      {/* 3. 가장 쉬운 방법 */}
      <section className="rd-section">
        <h2 className="rd-h2">가전을 빌리는<br />가장 쉬운 방법</h2>
        <div className="rd-steps">
          {[['01', '고르고', 'AI 살림 상담이나 1분 진단으로 필요한 가전만. 신청 전에 총비용을 보여드려요.'], ['02', '받고', '주 2회 지정일에 문 앞으로. 받은 날 사진 3장으로 상태를 같이 확인해요.'], ['03', '쓰고', '반납 없이 연장하면 배송비 0원. 계절이 바뀌면 다른 가전으로 교체.'], ['04', '돌려줘요', 'AI가 출고 사진과 비교해 새 흠집만 찾아요. 생활 마모는 0원.']].map(([n, a, b]) => (
            <div key={n} className="rd-step"><span className="rd-step-n">{n}</span><b>{a}</b><p>{b}</p></div>
          ))}
        </div>
      </section>

      {/* 3-1. 앱 화면 (히어로에서 내려옴) */}
      <section className="rd-section rd-app">
        <h2 className="rd-h2">앱에서는 이렇게 보여요</h2>
        <p className="rd-sub" style={{ textAlign: 'center', marginTop: -24 }}>반납일 · 연장 · 혜택은 홈에서, 반납할 땐 AI 예비 판정까지</p>
        <div className="rd-phones"><PhoneCheck /><PhoneHome /></div>
      </section>

      {/* 4. 혜택 카드 (해시태그) */}
      <section className="rd-section rd-soft">
        <h2 className="rd-h2">렌디라서 받는 혜택</h2>
        <div className="rd-grid">
          {[
            ['학교 인증하면 첫 달 50%', '성북구 7개 대학 학생이면 첫 렌탈 첫 달 반값, 배송비 1회 무료, 친구 초대 5,000원까지.', ['#첫달50%', '#배송비무료', '#친구초대'], '/school'],
            ['꾸러미로 빌리면 배송비 0원', '여러 개를 같이 빌려 월 3만원이 넘으면 배송·회수가 무료예요. 따로 빌리면 건마다 1만원이에요.', ['#꾸러미할인', '#배송비0원', '#같은날배송'], '/checkout'],
            ['AI가 보는 흠집, 0원인 생활 마모', '출고·반납 사진을 AI가 비교해 새 흠집만 찾고 길이를 재요. 2cm 이하는 0원.', ['#출고사진비교', '#생활마모0원', '#운영자최종판정'], '/try'],
            ['고장 걱정은 파손 케어로', '베이직 수리비 50% · 프리미엄 20%만 부담. 필요할 때만 골라요.', ['#베이직', '#프리미엄', '#생활마모0원'], '/products'],
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
          {PRODUCTS.map((p) => p.stock === 0 ? (
            <div key={p.id} className="rd-price sold" aria-disabled="true">
              <div style={{ background: p.bg }}><ProductArt p={p} size={72} /></div>
              <b>{p.name}</b><small>품절 · 입고 대기</small>
            </div>
          ) : (
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
