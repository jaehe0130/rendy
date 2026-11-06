import { Link } from 'react-router-dom'
import { CATEGORIES, PRODUCTS, won } from '../data'
import { Icon, Illust, ProductCard, SectionHead } from '../components'
import { BRAND } from '../theme'
import { useStore, dday } from '../store'
import { useState } from 'react'

const FAQ: [string, string][] = [
  ['보증금은 정말 없나요?', '네. 결제 카드만 등록해요. 파손은 렌터카 자차처럼 보장 단계(기본 월 0원 · 안심 1,000원 · 완전 안심 2,000원)를 골라요. 작은 긁힘 같은 생활 마모는 가입하지 않아도 0원이에요.'],
  ['최소 얼마나 빌려야 하나요?', '장기는 2개월부터 1개월 단위로 연장해요. 음식물 처리기는 4개월 미만이면 첫 달만 2만원(새 필터)이에요.'],
  ['일찍 반납하면 환불되나요?', '처음 고른 기간이 약정이라 환불은 없어요. 대신 언제든 연장하거나 다른 가전으로 교체할 수 있어요.'],
  ['배송비는 얼마예요?', '주 2회 정해진 요일(화·금)에 배송·회수해요. 한 번에 결제하는 월 렌탈료가 3만원 이상이면 무료, 미만이면 1만원이에요. 돈암동 거점 수령은 무료, 지정일 외 급행은 1만원이에요.'],
]

export default function Home() {
  const { user, rentals } = useStore()
  const [open, setOpen] = useState(0)
  const active = rentals.filter((r) => r.status === '사용 중')
  return (
    <>
      <section className="wrap" style={{ background: 'var(--butter)', paddingBlock: 'clamp(40px,7vw,80px)' }}>
        <div className="row gap-32 wrap-row between" style={{ alignItems: 'flex-end' }}>
          <div className="stack gap-16" style={{ maxWidth: 640 }}>
            <span className="eyebrow" style={{ color: 'var(--ink)' }}>Share · Rent · Reuse</span>
            <h1 className="serif" style={{ fontSize: 'clamp(40px,6vw,72px)' }}>
              {user ? <>{user.name} 님,<br />필요한 가전만 구독하세요</> : <>필요한 가전만<br />필요한 만큼 구독</>}
            </h1>
            <p className="serif" style={{ fontSize: 'clamp(18px,2vw,26px)', fontWeight: 400 }} >성북구 이웃 모두의 살림</p>
            <p className="muted">2개월부터 · 세척·소모품 포함 · 보증금 없음 · 주 2회 지정일 배송</p>
            <div className="row gap-12 wrap-row">
              <Link to="/products" className="btn">가전 보러 가기</Link>
              <Link to="/quiz" className="btn line">1분 진단</Link>
            </div>
          </div>
          <div className="row" style={{ alignItems: 'flex-end', gap: 0 }} aria-hidden>
            <Illust k="humidifier" size={140} />
            <Illust k="dryer" size={210} />
            <Illust k="dehumidifier" size={170} />
          </div>
        </div>
      </section>

      {user && active.length > 0 && (
        <section className="wrap" style={{ paddingBlock: 24 }}>
          <Link to="/my" className="card row between wrap-row gap-16">
            <div className="row gap-16">
              <span className="eyebrow">My rental</span>
              <b>사용 중 {active.length}대</b>
              <span className="muted">가장 빠른 반납 D-{Math.min(...active.map((r) => dday(r.end)))}</span>
            </div>
            <span className="link">내 렌탈 보기 {Icon.arrow}</span>
          </Link>
        </section>
      )}

      <section className="wrap" style={{ background: 'var(--surface)', paddingBlock: 24 }}>
        <div className="grid g4" style={{ gap: 16 }}>
          {[['주 2회 지정일 배송', '월 3만원 이상 배송비 무료'], ['세척 · 소모품 포함', '정비 기록 공개'], ['일반형 · 실속형', '3년 넘은 기기는 더 싸게'], ['AI 절약 리포트', '사는 값과 바로 비교']].map(([a, b]) => (
            <div key={a} className="stack gap-4"><b>{a}</b><span className="muted" style={{ fontSize: 13 }}>{b}</span></div>
          ))}
        </div>
      </section>

      <section className="section">
        <Link to="/school" className="row between wrap-row gap-24" style={{ background: 'var(--primary)', color: '#fff', padding: 'clamp(24px,4vw,44px)' }}>
          <div className="stack gap-8">
            <span className="eyebrow" style={{ color: '#fff' }}>Seongbuk students only</span>
            <h2 className="serif" style={{ fontSize: 'clamp(26px,3.6vw,40px)' }}>학교 인증하면 첫 렌탈 첫 달 50%</h2>
            <p style={{ opacity: .9 }}>성신여대 · 고려대 · 국민대 · 한성대 · 동덕여대 · 서경대 · KC대</p>
          </div>
          <span className="btn" style={{ background: '#fff', color: 'var(--ink)', borderColor: '#fff' }}>혜택 받기</span>
        </Link>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <SectionHead en="Shop by category" title="필요한 가전부터 골라보세요" right={<Link to="/products" className="link">전체 보기 {Icon.arrow}</Link>} />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {CATEGORIES.map((c) => (
            <Link key={c.key} to={`/products?cat=${c.key}`} className="stack gap-8" style={{ background: c.bg, padding: 24, minHeight: 240, justifyContent: 'space-between' }}>
              <div><span className="eyebrow" style={{ color: 'var(--ink-2)' }}>{c.en}</span><h3 className="serif" style={{ fontSize: 24 }}>{c.name}</h3></div>
              <div style={{ alignSelf: 'center' }}><Illust k={c.illust} size={110} /></div>
              <span className="link" style={{ fontSize: 14 }}>보러 가기 {Icon.arrow}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <SectionHead en="Best this month" title="이번 달 성북구 이웃들이 많이 빌린 가전" />
        <div className="grid g4">{PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="section bg-surface">
        <SectionHead en="Why rent" title="사는 것 vs 빌리는 것 (제습기 4개월)" right={<Link to="/guide" className="link">가이드 읽기 {Icon.arrow}</Link>} />
        <div className="scroll-x">
          <table className="table" style={{ background: '#fff', minWidth: 640 }}>
            <thead><tr><th></th><th>새로 사기</th><th>중고 거래</th><th style={{ color: 'var(--primary)' }}>{BRAND.name}</th></tr></thead>
            <tbody>
              {[['처음 드는 돈', '377,000원', '약 150,000원', `월 ${won(15000)} · 4개월 ${won(60000)}`], ['배송 · 설치', '직접 · 유료', '직접 가지러 감', '지정일 배송 · 3만원 이상 무료'], ['다 쓰고 나면', '버리거나 팔아야 함', '다시 팔아야 함', '반납하면 끝'], ['위생 · 상태', '새 제품', '알 수 없음', '세척 · 정비 기록 공개']].map((r) => (
                <tr key={r[0]}><td><b>{r[0]}</b></td><td className="muted">{r[1]}</td><td className="muted">{r[2]}</td><td style={{ color: 'var(--primary)', fontWeight: 600 }}>{r[3]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <SectionHead en="How it works" title="가전이 도는 방법" />
        <div className="stack">
          <hr className="rule ink" />
          {[['01', '기간 고르고 빌리기', '2개월부터 · 일반형 또는 실속형 · 받는 날만 고르면 반납일은 자동'], ['02', '정해진 날 문 앞으로', '주 2회(화·금) 배송·회수 · 월 3만원 이상 무료 · 받은 날 사진 3장으로 상태 확인'], ['03', '쓰는 동안 자유롭게', '연장(쿠폰) · 다른 가전으로 교체 · 반납 신청을 웹에서 바로'], ['04', '떠날 땐 렌디에 팔기', '사진 찍고 예상 매입가 확인 · 무료 수거 · 검수 끝나면 바로 입금']].map(([n, a, b]) => (
            <div key={n}>
              <div className="row gap-32" style={{ paddingBlock: 24 }}>
                <span className="serif" style={{ fontSize: 'clamp(40px,5vw,60px)', color: 'var(--primary)', fontWeight: 400, minWidth: 70 }}>{n}</span>
                <div className="stack gap-4"><b style={{ fontSize: 20 }}>{a}</b><span className="muted">{b}</span></div>
              </div>
              <hr className="rule" />
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-ink">
        <h2 className="serif" style={{ fontSize: 'clamp(32px,5vw,56px)', marginBottom: 20 }}>버려지는 가전 없이,<br />모두가 나눠 쓰는 동네</h2>
        <p style={{ color: 'var(--ink-3)', maxWidth: 640, marginBottom: 40 }}>떠나는 이웃에게서 사들인 가전을 세척·정비해 다음 이웃에게 빌려줘요.</p>
        <div className="grid g4">
          {[['412', '다시 쓰인 가전'], ['2개월', '부터 빌리기'], ['0원', '보증금'], ['+5%p', '렌디 이용자 매입 우대']].map(([a, b]) => (
            <div key={b} className="stack gap-8"><span className="num" style={{ fontSize: 'clamp(44px,6vw,72px)', color: 'var(--primary)' }}>{a}</span><span>{b}</span></div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead en="FAQ" title="자주 묻는 질문" />
        <div className="stack"><hr className="rule ink" />
          {FAQ.map(([q, a], i) => (
            <div key={q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="row between" style={{ width: '100%', background: 'none', border: 0, padding: '22px 0', textAlign: 'left' }}>
                <b style={{ fontSize: 17 }}>{q}</b><span style={{ fontSize: 22 }}>{open === i ? '—' : '+'}</span>
              </button>
              {open === i && <p className="muted" style={{ paddingBottom: 22 }}>{a}</p>}
              <hr className="rule" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
