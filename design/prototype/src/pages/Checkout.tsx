import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PRICING, planOf, deliveryFee as feeFor, firstMonth, productById, won } from '../data'
import { Illust } from '../components'
import { useStore, iso, addDays } from '../store'

type Delivery = 'scheduled' | 'hub' | 'express'

export function Checkout() {
  const { cart, user, coupons, removeFromCart, checkout } = useStore()
  const nav = useNavigate()
  const [delivery, setDelivery] = useState<Delivery>('scheduled')
  const [start, setStart] = useState(iso(addDays(new Date(), 2)))
  const [pay, setPay] = useState('카카오페이')
  const usable = coupons.filter((c) => !c.used)
  const [picked, setPicked] = useState<string[]>(usable.map((c) => c.id))
  if (!user) return <Navigate to="/login?next=/checkout" replace />
  if (cart.length === 0)
    return (
      <section className="section stack gap-16" style={{ alignItems: 'flex-start' }}>
        <h1 className="serif" style={{ fontSize: 34 }}>꾸러미가 비어 있어요</h1>
        <p className="muted">가전을 담거나 AI 살림 상담으로 꾸러미를 추천받아 보세요.</p>
        <div className="row gap-12"><Link to="/products" className="btn">가전 보러 가기</Link><Link to="/ai" className="btn line">AI 상담</Link></div>
      </section>
    )

  const lines = cart.map((c) => {
    const p = productById(c.productId)!
    const first = c.mode === 'long' ? firstMonth(p, c.grade, c.months) : c.weeks === 1 ? p.weekly!.w1 : p.weekly!.w2
    const care = planOf(c.plan).fee
    return { c, p, first, care }
  })
  const n = cart.length
  const rentFirst = lines.reduce((a, l) => a + l.first, 0)
  const deliveryFee = delivery === 'hub' ? 0 : delivery === 'express' ? PRICING.express : feeFor(rentFirst)
  const careFirst = lines.reduce((a, l) => a + l.care, 0)
  const longMax = Math.max(0, ...lines.filter((l) => l.c.mode === 'long').map((l) => l.first))
  const discounts = usable.filter((c) => picked.includes(c.id)).map((c) => {
    if (c.kind === 'firstMonth') return { c, amt: Math.min(PRICING.firstMonthCouponMax, Math.floor(longMax / 2)) }
    if (c.kind === 'doorFree') return { c, amt: deliveryFee }
    if (c.kind === 'invite') return { c, amt: 5000 }
    return { c, amt: 3000 }
  }).filter((d) => d.amt > 0)
  const disc = discounts.reduce((a, d) => a + d.amt, 0)
  const today = Math.max(0, rentFirst + careFirst + deliveryFee - disc)
  const monthlyAfter = lines.filter((l) => l.c.mode === 'long').reduce((a, l) => a + (l.c.grade === 'value' && l.p.monthly.value != null ? l.p.monthly.value : l.p.monthly.standard) + l.care, 0)

  const submit = () => {
    const ids = checkout(start, discounts.map((d) => d.c.id))
    nav('/complete', { state: { ids, today, delivery, start } })
  }

  return (
    <section className="section bg-surface">
      <h1 className="serif" style={{ fontSize: 'clamp(30px,4vw,40px)', marginBottom: 28 }}>주문하기 {n > 1 && <span className="faint" style={{ fontSize: 20 }}>· 꾸러미 {n}대</span>}</h1>
      <div className="split">
        <div className="stack gap-16">
          <div className="panel stack gap-16">
            <b style={{ fontSize: 18 }}>담은 가전 {n > 1 && '· 같은 날 받고 같은 날 반납'}</b>
            {lines.map(({ c, p, first }) => (
              <div key={c.key} className="row gap-16">
                <div style={{ background: p.bg, width: 72, height: 72, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Illust k={p.illust} size={54} /></div>
                <div className="stack" style={{ flex: 1 }}>
                  <b>{p.name}</b>
                  <span className="muted" style={{ fontSize: 13 }}>{c.mode === 'long' ? `${c.grade === 'standard' ? '일반형' : '실속형'} · ${c.months}개월 · 월 ${won(first)}` : `1주 단기 · ${c.weeks}주 · ${won(first)}`}{` · ${planOf(c.plan).name} 보장`}</span>
                </div>
                <button className="faint" style={{ background: 'none', border: 0, fontSize: 13 }} onClick={() => removeFromCart(c.key)}>빼기</button>
              </div>
            ))}
          </div>
          <div className="panel stack gap-12">
            <b style={{ fontSize: 18 }}>받는 날</b>
            <input type="date" className="input" value={start} min={iso(addDays(new Date(), 2))} onChange={(e) => setStart(e.target.value)} style={{ maxWidth: 260 }} />
            <span className="faint" style={{ fontSize: 13 }}>오늘 + 2일부터 · 돌려주는 날은 기간에 맞춰 자동으로 정해져요</span>
          </div>
          <div className="panel stack gap-12">
            <b style={{ fontSize: 18 }}>받는 방법</b>
            {([['scheduled', '문 앞 · 주 2회 지정일 배송·회수 (화·금)', `월 렌탈료 합계 ${won(PRICING.freeOver)} 이상 무료 · 미만이면 ${won(PRICING.delivery)}`], ['hub', '돈암동 거점 수령', '무료 · 성신여대입구역 도보 3분 · 결제 후 비밀번호 문자'], ['express', '지정일 외 급행 배송', `${won(PRICING.express)}`]] as const).map(([k, a, b]) => (
              <label key={k} className="row gap-12" style={{ border: delivery === k ? '2px solid var(--ink)' : '1px solid var(--line)', padding: delivery === k ? 15 : 16, cursor: 'pointer' }}>
                <input type="radio" name="delivery" checked={delivery === k} onChange={() => setDelivery(k)} />
                <div className="stack"><b style={{ fontSize: 15 }}>{a}</b><span className="faint" style={{ fontSize: 13 }}>{b}</span></div>
              </label>
            ))}
            {delivery !== 'hub' && <input className="input" placeholder="성북구 주소 (예: 동소문로 ○○ 302호)" aria-label="주소" />}
          </div>
          <div className="panel stack gap-12">
            <b style={{ fontSize: 18 }}>결제 수단 · 정기 결제</b>
            <div className="chips">{['카카오페이', '토스페이', '신용·체크카드'].map((x) => <button key={x} className={`chip ${pay === x ? 'on' : ''}`} onClick={() => setPay(x)}>{x}</button>)}</div>
            <span className="faint" style={{ fontSize: 13 }}>보증금 대신 카드만 등록해요. 장기는 매달 같은 날 자동 결제돼요.</span>
          </div>
          {usable.length > 0 && (
            <div className="panel stack gap-12">
              <b style={{ fontSize: 18 }}>학생 혜택 쿠폰</b>
              {usable.map((c) => (
                <label key={c.id} className="row gap-12" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={picked.includes(c.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, c.id] : picked.filter((x) => x !== c.id))} />
                  <span style={{ flex: 1 }}>{c.title}</span><span className="faint" style={{ fontSize: 13 }}>{c.desc}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="panel stack gap-12" style={{ position: 'sticky', top: 120 }}>
          <b className="serif" style={{ fontSize: 22 }}>결제 요약</b>
          <hr className="rule ink" />
          <div className="kv"><span>첫 달 렌탈료</span><b>{won(rentFirst)}</b></div>
          {careFirst > 0 && <div className="kv"><span>파손 보장</span><b>{won(careFirst)}</b></div>}
          <div className="kv"><span>보증금</span><b>없음</b></div>
          <div className="kv"><span>배송 · 회수</span><b>{deliveryFee ? won(deliveryFee) : delivery === 'hub' ? '0원 (거점 수령)' : `0원 (${won(PRICING.freeOver)} 이상)`}</b></div>
          {discounts.map((d) => <div key={d.c.id} className="kv"><span>{d.c.title}</span><b style={{ color: 'var(--primary)' }}>-{won(d.amt)}</b></div>)}
          <hr className="rule" />
          <div className="kv" style={{ alignItems: 'baseline' }}><span>오늘 결제</span><b className="serif" style={{ fontSize: 28 }}>{won(today)}</b></div>
          {monthlyAfter > 0 && <span className="faint" style={{ fontSize: 13 }}>2개월째부터 매달 {won(monthlyAfter)} 정기 결제</span>}
          <button className="btn block" onClick={submit}>{won(today)} 결제하기</button>
          <span className="demo-note">프로토타입: 실제 결제는 일어나지 않아요.</span>
        </div>
      </div>
    </section>
  )
}

export function Complete() {
  const loc = useLocation() as { state?: { ids: string[]; today: number; delivery: Delivery; start: string } }
  const st = loc.state
  return (
    <section className="section bg-surface" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="panel stack gap-16" style={{ width: 'min(640px,100%)', alignItems: 'center', textAlign: 'center', padding: 48 }}>
        <div style={{ width: 80, height: 80, background: 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 36 }}>✓</div>
        <h1 className="serif" style={{ fontSize: 32 }}>빌리기 완료!</h1>
        {st ? (
          <>
            <p className="muted">{st.start} {st.delivery === 'hub' ? '돈암동 거점 보관함에 넣어 두고 비밀번호를 문자로 보내드릴게요.' : '정해진 배송일에 문 앞으로 갖다드릴게요. 하루 전에 알림을 보내드려요.'}</p>
            <div className="stack gap-8" style={{ width: '100%', background: 'var(--surface)', padding: 20 }}>
              <div className="kv"><span>주문번호</span><b>{st.ids.join(', ')}</b></div>
              <div className="kv"><span>오늘 결제</span><b>{won(st.today)}</b></div>
            </div>
          </>
        ) : <p className="muted">주문 내역은 내 렌탈에서 볼 수 있어요.</p>}
        <div className="row gap-12"><Link to="/products" className="btn line">더 둘러보기</Link><Link to="/my" className="btn">내 렌탈 보기</Link></div>
      </div>
    </section>
  )
}
