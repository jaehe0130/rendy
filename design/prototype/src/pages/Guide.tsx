import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCTS, bundleSaving, gradeFor, lowest, productById, won } from '../data'
import { Bar, Illust, ProductCard, ProductArt } from '../components'
import { BRAND } from '../theme'
import { useStore } from '../store'

export function Guide() {
  const p = productById('dehumidifier-10')!
  return (
    <>
      <section className="wrap" style={{ background: 'var(--sky)', paddingTop: 56 }}>
        <div className="row between wrap-row gap-32" style={{ alignItems: 'flex-end', maxWidth: 1000, margin: '0 auto' }}>
          <div className="stack gap-16" style={{ paddingBottom: 56 }}>
            <span className="eyebrow" style={{ color: 'var(--ink-2)' }}>Appliance guide · 계절 가전</span>
            <h1 className="serif" style={{ fontSize: 'clamp(34px,5vw,52px)' }}>장마철 원룸 제습기,<br />사야 할까 빌려야 할까?</h1>
            <div className="row gap-12 wrap-row"><span className="badge">AI 초안 · 운영자 검수</span><span className="faint" style={{ fontSize: 13 }}>3분 읽기 · 리뷰 124개 분석</span></div>
          </div>
          <Illust k="dehumidifier" size={260} />
        </div>
      </section>
      <article className="wrap stack gap-48" style={{ maxWidth: 1000 + 0, margin: '0 auto', paddingBlock: 64 }}>
        <div className="stack gap-16">
          <div className="row gap-8"><span className="badge orange">AI</span><span className="eyebrow" style={{ color: 'var(--ink-2)' }}>Why people rent</span></div>
          <h2 className="serif" style={{ fontSize: 28 }}>이런 이유로 빌렸어요</h2>
          <hr className="rule ink" />
          {p.reasons.map(([r, pct]) => (
            <div key={r} className="row gap-16"><span style={{ width: 'min(260px,40%)' }}>{r}</span><div style={{ flex: 1 }}><Bar pct={pct * 2} orange={pct >= 40} /></div><span className="num" style={{ fontSize: 28, minWidth: 56, textAlign: 'right' }}>{pct}%</span></div>
          ))}
        </div>
        <div className="stack gap-16">
          <div className="row gap-8"><span className="badge orange">AI</span><span className="eyebrow" style={{ color: 'var(--ink-2)' }}>Compare</span></div>
          <h2 className="serif" style={{ fontSize: 28 }}>어떤 제습기가 맞을까?</h2>
          <div className="grid g2">{PRODUCTS.filter((x) => x.category === 'seasonal').map((x) => <ProductCard key={x.id} p={x} />)}</div>
          <div className="scroll-x"><table className="table" style={{ minWidth: 560 }}>
            <thead><tr><th></th><th>10L 일반형</th><th>16L</th><th>10L 실속형</th></tr></thead>
            <tbody>{[['방 크기', '원룸 5~8평', '투룸 이상', '원룸 5~8평'], ['한 달 전기요금', '약 4,000원', '약 6,500원', '약 4,000원'], ['물통', '2.2L', '3.5L', '2.2L'], ['월 렌탈료', '15,000원', '19,000원', '10,000원']].map((r) => <tr key={r[0]}><td className="muted">{r[0]}</td><td><b>{r[1]}</b></td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
          </table></div>
          <div className="row gap-12" style={{ background: 'var(--peach)', padding: '16px 20px' }}><span className="badge orange">AI</span><span>원룸 6평이면 10L로 충분해요. 4개월만 쓸 거면 실속형이 월 5,000원 더 싸요.</span></div>
        </div>
        <div className="stack gap-16">
          <div className="row gap-8"><span className="badge orange">AI</span><span className="eyebrow" style={{ color: 'var(--ink-2)' }}>Review summary</span></div>
          <h2 className="serif" style={{ fontSize: 28 }}>후기 요약</h2>
          <div className="grid g3">{[['좋았던 점', p.review.good], ['아쉬운 점', p.review.bad], ['이런 사람에게', p.review.who]].map(([a, b]) => <div key={a} className="stack gap-8"><span className="eyebrow" style={{ color: 'var(--ink-3)' }}>{a}</span><b>{b}</b></div>)}</div>
          <div style={{ background: 'var(--surface)', padding: 32 }}><p className="serif" style={{ fontSize: 26 }}>“{p.review.quote}”</p><span className="faint" style={{ fontSize: 13 }}>{p.review.who2}</span></div>
        </div>
        <div className="bg-ink stack gap-24" style={{ padding: 'clamp(24px,4vw,44px)' }}>
          <span className="eyebrow">Conclusion</span>
          <h2 className="serif" style={{ fontSize: 'clamp(28px,4vw,40px)' }}>4개월만 쓸 거면<br />빌리는 게 31만 원 이득</h2>
          <div className="grid g3">{[['새로 사기', won(377000)], ['중고 + 되팔기', '약 150,000원'], [`${BRAND.name} 4개월`, won(60000)]].map(([a, b], i) => <div key={a} className="stack gap-4"><span style={{ color: 'var(--ink-3)', fontSize: 14 }}>{a}</span><span className="num" style={{ fontSize: 40, color: i === 2 ? 'var(--primary)' : '#fff' }}>{b}</span></div>)}</div>
          <div className="row gap-12 wrap-row"><Link to="/products/dehumidifier-10" className="btn accent">제습기 빌리러 가기</Link><Link to="/quiz" className="btn line">1분 진단 받기</Link></div>
        </div>
      </article>
    </>
  )
}

const QS: { q: string; opts: string[] }[] = [
  { q: '방 크기는 어떻게 되나요?', opts: ['원룸 5평 이하', '원룸 5~8평', '투룸 이상'] },
  { q: '빨래는 어디서 말리세요?', opts: ['방 안 건조대', '욕실', '코인세탁소', '건조기 있음'] },
  { q: '지금 집에서 얼마나 지내세요?', opts: ['2~3개월', '4~6개월', '1년 이상', '곧 이사·입대·유학'] },
  { q: '한 달 예산은요?', opts: ['2만 원 이하', '2~4만 원', '4만 원 이상'] },
]

export function Quiz() {
  // ?view=result 이면 결과 화면부터 (시안 캡처·시연용)
  const showResult = new URLSearchParams(location.search).get('view') === 'result'
  const [i, setI] = useState(showResult ? 4 : 0)
  const [ans, setAns] = useState<number[]>(showResult ? [1, 0, 1, 1] : [])
  const nav = useNavigate()
  const { addToCart, user } = useStore()
  if (i >= QS.length) {
    const indoor = ans[1] === 0 || ans[1] === 1
    const leaving = ans[2] === 3
    const months = [3, 4, 6, 2][ans[2]] ?? 4
    const picks = [indoor ? 'mini-dryer' : null, 'dehumidifier-10', ans[3] === 2 ? 'humidifier' : null].filter(Boolean) as string[]
    const type = indoor ? '장마철 뽀송 지킴이형' : leaving ? '가볍게 떠나는 노마드형' : '쾌적한 공기 관리형'
    const sum = picks.reduce((a, id) => a + lowest(productById(id)!), 0)
    const bundle = bundleSaving(picks.map((id) => lowest(productById(id)!)))
    return (
      <section className="section bg-surface">
        <div className="split" style={{ gridTemplateColumns: 'min(420px,100%) minmax(0,1fr)' }}>
          <div className="stack gap-16 bg-ink" style={{ padding: 36 }}>
            <span className="eyebrow" style={{ color: 'var(--ink-3)' }}>My appliance type</span>
            <h1 className="serif" style={{ fontSize: 40 }}>{type}</h1>
            <div style={{ background: 'var(--sky)', display: 'grid', placeItems: 'center', padding: 24 }}><Illust k={indoor ? 'dryer' : 'dehumidifier'} size={160} /></div>
            <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>{QS.map((q, k) => q.opts[ans[k]]).join(' · ')}</span>
            <div className="row between faint" style={{ fontSize: 12 }}><span>{BRAND.name} · 1분 진단</span><span>modu.app/quiz</span></div>
          </div>
          <div className="panel stack gap-16">
            <div className="row gap-8"><span className="badge orange">AI</span><span className="eyebrow" style={{ color: 'var(--ink-2)' }}>Recommended bundle</span></div>
            <h2 className="serif" style={{ fontSize: 32 }}>{months}개월 추천 꾸러미</h2>
            <hr className="rule ink" />
            {picks.map((id) => { const p = productById(id)!; return (
              <div key={id} className="row gap-16"><div style={{ background: p.bg, width: 64, height: 64, display: 'grid', placeItems: 'center' }}><ProductArt p={p} size={48} /></div><div className="stack" style={{ flex: 1 }}><b>{p.name}</b><span className="muted" style={{ fontSize: 13 }}>{p.monthly.value != null ? '실속형' : '일반형'} · 월 {won(lowest(p))}</span></div></div>
            ) })}
            <hr className="rule" />
            <div className="kv"><span>사면</span><b>{won(picks.reduce((a, id) => a + productById(id)!.newPrice, 0))}</b></div>
            <div className="kv"><span>{months}개월 빌리면</span><b className="serif" style={{ fontSize: 24 }}>{won(sum * months)}</b></div>
            {bundle.saved > 0 && <div className="bundle-save"><b>꾸러미로 빌리면 {won(bundle.saved)} 더 싸요</b><span>따로 빌리면 배송·회수 {won(bundle.apart)} → 꾸러미로 {won(bundle.together)}</span></div>}
            <div className="row gap-12 wrap-row">
              <button className="btn" onClick={() => { picks.forEach((id) => addToCart({ productId: id, mode: 'long', grade: gradeFor(productById(id)!, 'value'), months: Math.max(2, months), weeks: 1, plan: 'full' })); nav(user ? '/checkout' : '/login?next=/checkout') }}>꾸러미로 빌리기</button>
              <Link to="/ai" className="btn line">AI 살림 상담하기</Link>
            </div>
            <div className="row gap-8 wrap-row"><b style={{ fontSize: 14 }}>결과 공유</b>{['카카오톡', '인스타 스토리', '링크 복사'].map((x) => <span key={x} className="chip">{x}</span>)}</div>
            <button className="faint" style={{ background: 'none', border: 0, textAlign: 'left', fontSize: 13 }} onClick={() => { setI(0); setAns([]) }}>다시 진단하기</button>
          </div>
        </div>
      </section>
    )
  }
  const q = QS[i]
  return (
    <section className="section bg-surface">
      <div className="stack gap-24" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="row between"><span className="eyebrow" style={{ color: 'var(--ink-2)' }}>1-minute check</span><span className="num" style={{ fontSize: 28 }}>{i + 1} / {QS.length}</span></div>
        <Bar pct={((i + 1) / QS.length) * 100} />
        <h1 className="serif" style={{ fontSize: 'clamp(32px,5vw,48px)' }}>{q.q}</h1>
        <div className="stack gap-8">
          {q.opts.map((o, k) => (
            <button key={o} className="row between" style={{ background: '#fff', border: ans[i] === k ? '2px solid var(--ink)' : '1px solid var(--line)', padding: '20px 22px', fontSize: 17, textAlign: 'left' }} onClick={() => { const a = [...ans]; a[i] = k; setAns(a); setTimeout(() => setI(i + 1), 150) }}>
              {o}<span className="faint">→</span>
            </button>
          ))}
        </div>
        <div className="row between"><button className="btn line" disabled={i === 0} onClick={() => setI(i - 1)}>이전</button><span className="faint" style={{ fontSize: 13 }}>로그인 없이 할 수 있어요</span></div>
      </div>
    </section>
  )
}
