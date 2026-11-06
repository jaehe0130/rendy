import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUYBACK, PRODUCTS, won } from '../data'
import { Illust, SectionHead, Toast } from '../components'
import { useStore } from '../store'
import { Upload } from './My'

export default function Sell() {
  const { user, rentals, addSell } = useStore()
  const nav = useNavigate()
  // ?view=quote (예상 매입가 결과) (시안 캡처·시연용)
  const viewQ = new URLSearchParams(location.search).get('view')
  const [pid, setPid] = useState(PRODUCTS[0].id)
  const [years, setYears] = useState(1)
  const [cond, setCond] = useState(0)
  const [photos, setPhotos] = useState(viewQ ? 3 : 0)
  const [quote, setQuote] = useState<'idle' | 'done'>(viewQ === 'quote' ? 'done' : 'idle')
  const [toast, setToast] = useState('')
  const p = PRODUCTS.find((x) => x.id === pid)!
  // 바이백 견적 (기능명세서 부록 C-9): 구매 1년 이하 30% · 2년 이하 25%, 렌디 이용자 +5%p, 상태 계수, 천 원 단위
  const canBuy = years <= 2
  const member = !!user && rentals.length > 0
  const rate = (years === 1 ? BUYBACK.rate1y : BUYBACK.rate2y) + (member ? BUYBACK.memberBonus : 0)
  // 금액은 계산식으로만 정하고(AI가 정하지 않음), 최종가는 수거 후 운영자 검수로 확정 — 그래서 범위로 보여줌
  const base = p.newPrice * rate * [1, 0.85, 0.7][cond]
  const lo = Math.round((base * 0.9) / 1000) * 1000
  const hi = Math.round((base * 1.1) / 1000) * 1000
  const needLogin = () => { if (!user) { nav('/login?next=/sell'); return true } return false }
  const done = (m: string) => { setToast(m); setTimeout(() => { setToast(''); nav('/my') }, 1400) }
  const resetForm = () => { setQuote('idle'); setPhotos(0) }

  return (
    <>
      <section className="wrap" style={{ background: 'var(--butter)', paddingBlock: 'clamp(40px,6vw,72px)' }}>
        <div className="row between wrap-row gap-32" style={{ alignItems: 'flex-end' }}>
          <div className="stack gap-16">
            <span className="eyebrow">Sell · Buyback</span>
            <h1 className="serif" style={{ fontSize: 'clamp(34px,5vw,52px)' }}>떠날 때 가전,<br />버리지 말고 렌디에 파세요</h1>
            <p className="muted">이사 · 입대 · 유학 · 졸업으로 정리할 때. 사진 3장으로 견적, 무료 수거, 검수 끝나면 바로 입금.</p>
          </div>
          <Illust k="box" size={200} />
        </div>
      </section>

      <section className="section">
        <SectionHead en="Compare" title="쓰던 가전, 어떻게 정리할까?" />
        <div className="grid g3" style={{ gap: 0, borderTop: '1px solid var(--ink)' }}>
          {[['버리기', '대형 폐기물 스티커 3,000~8,000원', '돈을 내야 해요'], ['옮기기', '용달 · 새 집 공간 필요', '다시 쓸 일이 있을 때'], ['렌디에 팔기', '예상 매입가 확인 → 무료 수거 → 검수 후 바로 입금', '다음 1인 가구가 다시 써요']].map(([a, b, c], i) => (
            <div key={a} className="stack gap-8" style={{ padding: `24px 20px 24px ${i ? 20 : 0}px`, borderLeft: i ? '1px solid var(--line)' : 0, opacity: i < 2 ? 0.55 : 1 }}>
              <b style={{ fontSize: 20, color: i >= 2 ? 'var(--primary)' : undefined }}>{a}</b><span>{b}</span><span className="faint" style={{ fontSize: 13 }}>{c}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-surface">
        <div className="split">
          <div className="panel stack gap-16">
            <div className="field"><label htmlFor="it">어떤 가전인가요?</label><select id="it" className="input" value={pid} onChange={(e) => { setPid(e.target.value); resetForm() }}>{PRODUCTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div className="field"><label>쓴 기간</label><div className="chips">{['1년 이하', '2년', '3년', '4년 이상'].map((x, i) => <button key={x} className={`chip ${years === i + 1 ? 'on' : ''}`} onClick={() => { setYears(i + 1); setQuote('idle') }}>{x}</button>)}</div></div>
            <div className="field"><label>상태</label><div className="chips">{['거의 새것', '생활 흠집', '눈에 띄는 흠집'].map((x, i) => <button key={x} className={`chip ${cond === i ? 'on' : ''}`} onClick={() => { setCond(i); setQuote('idle') }}>{x}</button>)}</div></div>
            <div className="stack gap-4"><b style={{ fontSize: 14 }}>사진 3장 (정면 · 옆면 · 작동 화면)</b><span className="faint" style={{ fontSize: 12 }}>운영자가 수거 전에 매입 조건을 확인하고, 수거하는 날 같은 상태인지 비교해요.</span></div>
            <div className="grid g3" style={{ gap: 8, gridTemplateColumns: 'repeat(3,1fr)' }}>{['정면', '옆면', '작동 화면'].map((x) => <Upload key={pid + x} label={x} onFile={() => setPhotos((n) => n + 1)} />)}</div>
            <button className="btn block" disabled={photos < 3 || !canBuy} onClick={() => setQuote('done')}>{!canBuy ? '구매 2년 이내 제품만 매입해요' : `예상 매입가 확인 (${photos}/3)`}</button>
            <span className="demo-note">예상 매입가 = 공식몰가 × 매입률(구매 1년 이하 30% · 2년 이하 25%, 렌디 이용자 +5%p) × 상태(거의 새것 1.0 · 생활 흠집 0.85 · 눈에 띄는 흠집 0.7). 사진은 AI가 판정하지 않고 운영자가 확인해요.</span>
          </div>

          <div className="panel stack gap-16" style={{ position: 'sticky', top: 120 }}>
            <div style={{ background: p.bg, display: 'grid', placeItems: 'center', padding: 20 }}><Illust k={p.illust} size={150} /></div>
            <b style={{ fontSize: 20 }}>{p.name}</b>
            {quote === 'done' ? (
              <>
                <span className="muted" style={{ fontSize: 13 }}>예상 매입가 · 검수 후 확정</span>
                <span className="num" style={{ fontSize: 40, color: 'var(--primary)' }}>{won(lo)} ~ {won(hi)}</span>
                <div className="kv"><span>새 제품가</span><b>{won(p.newPrice)}</b></div>
                <div className="kv"><span>매입률</span><b>{Math.round(rate * 100)}%{member ? ' (렌디 이용자 +5%p)' : ''}</b></div>
                <div className="kv"><span>연식 · 상태 반영</span><b>{['1년 이하', '2년', '3년', '4년 이상'][years - 1]} · {['거의 새것', '생활 흠집', '눈에 띄는 흠집'][cond]}</b></div>
                <div className="kv"><span>수거 · 입금</span><b>다음 배송일 문 앞 무료 수거 · 검수 끝나면 바로 입금</b></div>
                <div className="kv"><span>최종가</span><b>수거 후 운영자 검수(작동 · 전기 안전 · 흠집)로 확정</b></div>
                <span className="faint" style={{ fontSize: 12 }}>검수 결과는 사진과 함께 보여드려요. 범위를 벗어나면 먼저 동의를 받고, 원하지 않으면 무료로 돌려드려요.</span>
                {!member && <span className="faint" style={{ fontSize: 12 }}>렌디에서 빌려 쓴 적이 있으면 매입가를 5%p 더 드려요.</span>}
                <button className="btn block" onClick={() => { if (needLogin()) return; addSell({ kind: '팔기', item: p.name, amount: `${won(lo)} ~ ${won(hi)}`, status: '수거 예약 · 검수 후 확정' }); done('수거 예약 완료. 검수 끝나면 바로 입금돼요') }}>수거 신청하기</button>
              </>
            ) : (
              <span className="faint" style={{ fontSize: 14 }}>쓴 기간 · 상태를 고르고 사진 3장을 올리면 예상 매입가를 알려드려요.</span>
            )}
          </div>
        </div>
      </section>
      <Toast msg={toast} />
    </>
  )
}
