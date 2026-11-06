import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deliveryFee, gradeFor, lowest, productById, won } from '../data'
import { Illust } from '../components'
import { useStore } from '../store'

type Msg = { from: 'ai' | 'me'; text: string }

const STEPS = [
  { ask: '안녕하세요! 언제부터 언제까지 쓰실 거예요?', chips: ['11월부터 2월까지 (4개월)', '2~3개월', '6개월 이상'] },
  { ask: '방 크기와 한 달 예산을 알려주세요.', chips: ['원룸 5평 · 한 달 3만 원 이하', '원룸 6~8평 · 5만 원 이하', '투룸 · 예산 상관없음'] },
  { ask: '무엇 때문에 필요하세요? 소음·전기료처럼 중요한 조건도 같이 말해 주세요.', chips: ['빨래가 안 말라요', '습하고 곰팡이가 펴요', '건조해서 목이 아파요 · 조용한 걸로', '음식물 냄새가 나요'] },
]

function pickMonths(t: string) { const m = t.match(/(\d+)\s*개월/); if (m) return Math.max(2, +m[1]); if (/6|반년|1년/.test(t)) return 6; if (/2|3/.test(t)) return 3; return 4 }
function pickItems(t: string) {
  const out: string[] = []
  if (/빨래|건조대|안 말/.test(t)) out.push('mini-dryer')
  if (/습|곰팡이|장마|결로|빨래/.test(t)) out.push('dehumidifier-10')
  if (/건조해|목|가습|겨울/.test(t)) out.push('humidifier')
  if (/음식|냄새|초파리/.test(t)) out.push('foodwaste')
  return [...new Set(out)]
}

export default function Ai() {
  // ?view=result 이면 대화가 끝나 추천이 나온 상태 (시안 캡처·시연용)
  const preset = new URLSearchParams(location.search).get('view') === 'result'
  const PRESET_ITEMS = ['mini-dryer', 'dehumidifier-10', 'humidifier']
  const [msgs, setMsgs] = useState<Msg[]>(preset ? [
    { from: 'ai', text: STEPS[0].ask }, { from: 'me', text: '11월부터 2월까지 (4개월)' },
    { from: 'ai', text: STEPS[1].ask }, { from: 'me', text: '원룸 6평 · 한 달 5만 원 이하' },
    { from: 'ai', text: STEPS[2].ask }, { from: 'me', text: '빨래가 안 말라요. 겨울엔 건조해서 목이 아파요' },
    { from: 'ai', text: '4개월 동안 지금 빌릴 수 있는 것 중에서 3개를 골랐어요. 오른쪽에 추천 이유와 총비용, 기기 상태를 같이 적어 뒀어요.' },
  ] : [{ from: 'ai', text: STEPS[0].ask }])
  const [step, setStep] = useState(preset ? 3 : 0)
  const [input, setInput] = useState('')
  const [months, setMonths] = useState(4)
  const [items, setItems] = useState<string[]>(preset ? PRESET_ITEMS : [])
  const [checked, setChecked] = useState<Record<string, boolean>>(preset ? Object.fromEntries(PRESET_ITEMS.map((x) => [x, true])) : {})
  const [typing, setTyping] = useState(false)
  const [budget, setBudget] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const { addToCart, user, joinWaitlist, waitlist } = useStore()
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [msgs, typing])

  const send = (text: string) => {
    if (!text.trim() || typing) return
    setMsgs((m) => [...m, { from: 'me', text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      if (step === 0) { setMonths(pickMonths(text)); setStep(1); setMsgs((m) => [...m, { from: 'ai', text: STEPS[1].ask }]) }
      else if (step === 1) { const b = text.match(/(\d+)\s*만/); setBudget(b ? +b[1] * 10000 : 0); setStep(2); setMsgs((m) => [...m, { from: 'ai', text: STEPS[2].ask }]) }
      else {
        const found = pickItems(text)
        const list = found.length ? found : ['dehumidifier-10', 'mini-dryer']
        const merged = [...new Set([...items, ...list])].slice(0, 3)
        setItems(merged)
        setChecked(Object.fromEntries(merged.map((id) => [id, checked[id] ?? true])))
        setStep(3)
        const s = merged.filter((id) => productById(id)!.stock > 0).reduce((a, id) => a + lowest(productById(id)!), 0)
        const over = budget && s > budget ? ` 다만 한 달 ${won(s)}이라 예산 ${won(budget)}을 넘어요. 하나를 빼거나 실속형만 남기면 맞출 수 있어요.` : ''
        setMsgs((m) => [...m, { from: 'ai', text: `${months}개월 동안 지금 빌릴 수 있는 것 중에서 ${merged.length}개를 골랐어요. 오른쪽에 추천 이유와 총비용, 기기 상태를 같이 적어 뒀어요.${over}` }])
      }
    }, 600)
  }

  const chosen = items.filter((id) => checked[id])
  const sum = chosen.reduce((a, id) => a + lowest(productById(id)!), 0)
  const buy = chosen.reduce((a, id) => a + productById(id)!.newPrice, 0)
  const chips = step < 3 ? STEPS[step].chips : ['기간 바꾸기', '예산 3만 원 이하로', '다른 걸로 추천']

  return (
    <section className="section bg-surface">
      <div className="split" style={{ gridTemplateColumns: 'minmax(0,1fr) min(440px,100%)' }}>
        <div className="panel stack gap-16" style={{ minHeight: 560 }}>
          <div className="stack gap-4"><h1 className="serif" style={{ fontSize: 28 }}>AI 살림 상담</h1><span className="muted" style={{ fontSize: 14 }}>목적, 기간, 예산, 방 크기, 중요한 조건을 알려주면 지금 빌릴 수 있는 것 중에서 1~3개를 골라드려요.</span></div>
          <hr className="rule" />
          <div className="stack gap-12" style={{ flex: 1 }}>
            {msgs.map((m, i) => <div key={i} className={`bubble ${m.from}`}>{m.text}</div>)}
            {typing && <div className="bubble ai faint">입력 중…</div>}
            <div ref={endRef} />
          </div>
          <div className="chips">{chips.map((c) => <button key={c} className="chip" onClick={() => send(c)}>{c}</button>)}</div>
          <form className="row gap-8" onSubmit={(e) => { e.preventDefault(); send(input) }}>
            <input className="input" placeholder="상황을 입력하세요 (예: 11월부터 2월까지, 빨래가 안 말라요)" value={input} onChange={(e) => setInput(e.target.value)} aria-label="메시지" />
            <button className="btn" type="submit">보내기</button>
          </form>
          <span className="demo-note">프로토타입: 키워드로 추천하는 예시 로직이에요. 실제 서비스는 AI 모델이 대화를 이해해 추천해요.</span>
        </div>
        <div className="panel stack gap-16" style={{ position: 'sticky', top: 120 }}>
          <div className="row gap-8"><span className="badge orange">AI</span><span className="eyebrow" style={{ color: 'var(--ink-2)' }}>Recommended bundle</span></div>
          {items.length === 0 ? (
            <div className="stack gap-12" style={{ alignItems: 'center', textAlign: 'center', padding: '24px 0' }}>
              <Illust k="box" size={140} />
              <b>추천 꾸러미가 여기에 나와요</b>
              <span className="faint" style={{ fontSize: 13 }}>대화가 끝나면 필요한 가전과 합계를 보여드려요.</span>
            </div>
          ) : (
            <>
              <h2 className="serif" style={{ fontSize: 26 }}>{months}개월 꾸러미</h2>
              <hr className="rule ink" />
              {items.map((id) => { const p = productById(id)!; const sold = p.stock === 0; return (
                <label key={id} className="row gap-12" style={{ cursor: sold ? 'default' : 'pointer', opacity: checked[id] ? 1 : .5 }}>
                  <input type="checkbox" checked={!!checked[id]} disabled={sold} onChange={(e) => setChecked({ ...checked, [id]: e.target.checked })} />
                  <div style={{ background: p.bg, width: 56, height: 56, display: 'grid', placeItems: 'center' }}><Illust k={p.illust} size={42} /></div>
                  <div className="stack" style={{ flex: 1 }}><b>{p.name}</b><span className="faint" style={{ fontSize: 12 }}>이유: {p.reasons[0][0]}</span><span className="faint" style={{ fontSize: 12 }}>{p.monthly.value != null ? `실속형 · ${p.bought.value} 매입` : `일반형 · ${p.bought.standard} 매입`} · 세척·점검 기록 있음</span></div>
                  {sold ? <button className="btn sm line" disabled={waitlist.includes(id)} onClick={(e) => { e.preventDefault(); if (!user) return nav('/login?next=/ai'); joinWaitlist(id) }}>{waitlist.includes(id) ? '대기 등록됨' : '품절 · 대기 신청'}</button> : <b>월 {won(lowest(p))}</b>}
                </label>
              ) })}
              <hr className="rule" />
              <div className="kv"><span>새로 사면</span><b>{won(buy)}</b></div>
              <div className="kv"><span>{months}개월 대여료</span><b>{won(sum * months)}</b></div>
              <div className="kv"><span>배송 · 회수</span><b>{chosen.length ? (deliveryFee(sum) ? won(deliveryFee(sum)) : '0원 (월 3만원 이상)') : '—'}</b></div>
              <div className="kv" style={{ alignItems: 'baseline' }}><span>총비용</span><b className="serif" style={{ fontSize: 26 }}>{won(sum * months + (chosen.length ? deliveryFee(sum) : 0))}</b></div>
              {sum >= 30000 && <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>월 3만원 이상 · 배송·회수 무료</span>}
              <button className="btn block" disabled={!chosen.length} onClick={() => { chosen.forEach((id) => addToCart({ productId: id, mode: 'long', grade: gradeFor(productById(id)!, 'value'), months, weeks: 1, plan: 'full' })); nav(user ? '/checkout' : '/login?next=/checkout') }}>꾸러미 한 번에 빌리기</button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
