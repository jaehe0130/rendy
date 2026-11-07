import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CATEGORIES, PLANS, PRODUCTS, careFee, planOf, deliveryFee, firstMonth, priceOf, productById, usedFor, won, type Category } from '../data'
import type { PlanKey } from '../data'
import { Bar, Icon, Modal, ProductCard, SectionHead, Toast, ProductArt } from '../components'
import { useStore, type Grade } from '../store'
import '../viewer3d.css'

export function ProductList() {
  const [sp, setSp] = useSearchParams()
  const cat = (sp.get('cat') as Category | null) ?? null
  const [mode, setMode] = useState<'all' | 'value'>('all')
  const [stockOnly, setStockOnly] = useState(false)
  const [q, setQ] = useState('')
  const list = useMemo(
    () => PRODUCTS.filter((p) => (!cat || p.category === cat) && (mode !== 'value' || p.monthly.value != null) && (!stockOnly || p.stock > 0) && (!q || p.name.includes(q))),
    [cat, mode, stockOnly, q],
  )
  return (
    <section className="section">
      <div className="stack gap-8" style={{ marginBottom: 28 }}>
        <span className="faint" style={{ fontSize: 13 }}>빌리기 / {cat ? CATEGORIES.find((c) => c.key === cat)?.name : '전체'}</span>
        <h1 className="serif" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>{cat ? CATEGORIES.find((c) => c.key === cat)?.name : '전체 가전'} <span className="num faint" style={{ fontSize: 28 }}>{list.length}</span></h1>
      </div>
      <div className="stack gap-16" style={{ marginBottom: 32 }}>
        <input className="input" placeholder="제습기, 건조기 검색" value={q} onChange={(e) => setQ(e.target.value)} aria-label="검색" style={{ maxWidth: 420 }} />
        <div className="chips">
          <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => setSp({})}>전체</button>
          {CATEGORIES.map((c) => <button key={c.key} className={`chip ${cat === c.key ? 'on' : ''}`} onClick={() => setSp({ cat: c.key })}>{c.name}</button>)}
        </div>
        <div className="chips">
          {([['all', '전체'], ['value', '실속형 있음']] as const).map(([k, l]) => <button key={k} className={`chip ${mode === k ? 'on' : ''}`} onClick={() => setMode(k)}>{l}</button>)}
          <button className={`chip ${stockOnly ? 'on' : ''}`} onClick={() => setStockOnly(!stockOnly)}>지금 빌릴 수 있는 것만</button>
        </div>
      </div>
      <div className="grid g4">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      {list.length === 0 && (
        <div className="card stack gap-12" style={{ alignItems: 'flex-start' }}>
          <b>찾는 가전이 없어요.</b>
          <span className="muted">AI 살림 상담에 상황을 말해주면 맞는 가전을 골라드려요.</span>
          <Link to="/ai" className="btn line sm">AI 상담 하기</Link>
        </div>
      )}
    </section>
  )
}

export function ProductDetail() {
  const { id } = useParams()
  const p = productById(id ?? '')
  const nav = useNavigate()
  const { addToCart, user, joinWaitlist, waitlist } = useStore()
  const [mode, setMode] = useState<'long' | 'short'>('long')
  const [grade, setGrade] = useState<Grade>('standard')
  const [months, setMonths] = useState(4)
  const [customMonths, setCustomMonths] = useState(false)
  const [monthsText, setMonthsText] = useState('4')
  const [weeks, setWeeks] = useState(1)
  const [plan, setPlan] = useState<PlanKey>('full')
  const [toast, setToast] = useState('')
  const [wl, setWl] = useState(false)
  if (!p) return <section className="section"><p>상품을 찾을 수 없어요. <Link to="/products" className="link">목록으로</Link></p></section>
  const sold = p.stock === 0
  const unit = mode === 'long' ? priceOf(p, grade) : weeks === 1 ? p.weekly!.w1 : p.weekly!.w2
  const first = mode === 'long' ? firstMonth(p, grade, months) : unit
  const total = mode === 'long' ? first + unit * (months - 1) : unit
  const saved = p.newPrice - total
  const fee = deliveryFee(unit)
  const careOf = (k: PlanKey) => careFee(k, p.newPrice)
  const careSum = careOf(plan) * (mode === 'long' ? months : 1)
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 1800) }
  const add = (go: boolean) => {
    addToCart({ productId: p.id, mode, grade, months, weeks, plan })
    if (go) nav('/checkout'); else flash('꾸러미에 담았어요')
  }
  return (
    <>
      <section className="section" style={{ paddingBottom: 48 }}>
        <p className="faint" style={{ fontSize: 13, marginBottom: 20 }}><Link to="/products">빌리기</Link> / {CATEGORIES.find((c) => c.key === p.category)?.name} / {p.name}</p>
        <div className="split" style={{ gridTemplateColumns: 'minmax(0,1fr) min(460px,100%)' }}>
          <div className="grid g2" style={{ gap: 12 }}>
            {(p.photos?.length === 1 ? [0] : p.photos ? p.photos.map((_, i) => i).slice(0, 4) : [0, 1, 2, 3]).map((i, _, all) => (
              <div key={i} className="gallery-tile" style={{ background: p.bg, aspectRatio: all.length === 1 ? '1/0.9' : '1/1.1', gridColumn: all.length === 1 || (all.length === 3 && i === 0) ? '1 / -1' : undefined, display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
                <ProductArt p={p} i={i} size={i === 0 ? 220 : 150} />
                {i === 0 && <span className="badge solid" style={{ position: 'absolute', top: 12, left: 12 }}>세척 후 실물</span>}
                {i === 0 && p.model3d && <Link to={`/products/${p.id}/3d`} className="v3d-open"><i>3D</i>돌려보기 ›</Link>}
              </div>
            ))}
          </div>
          <div className="stack gap-16">
            <div className="row gap-8 wrap-row"><span className="badge solid">세척 인증</span><span className="badge">소모품 포함</span><span className="badge soft">{p.source}</span></div>
            <span className="eyebrow" style={{ color: 'var(--ink-3)' }}>{p.model}</span>
            <h1 className="serif" style={{ fontSize: 36 }}>{p.name}</h1>
            <span className="muted" style={{ fontSize: 14 }}>★ {p.rating.toFixed(1)} · 리뷰 {p.reviewCount}</span>
            <div className="row gap-8" style={{ alignItems: 'baseline' }}><b className="serif" style={{ fontSize: 32 }}>{mode === 'long' ? `월 ${won(unit)}` : won(unit)}</b><span className="faint">{mode === 'long' ? `${grade === 'standard' ? '일반형' : '실속형'} · 보증금 없음` : `${weeks}주 · 보증금 없음`}</span></div>
            <hr className="rule ink" />

            {sold ? (
              <div className="stack gap-12">
                <span className="badge solid" style={{ alignSelf: 'flex-start' }}>품절 · 대기 {p.waitlist + (waitlist.includes(p.id) ? 1 : 0)}명</span>
                <p className="muted">지금은 모두 대여 중이에요. 대기 명단에 올리면 들어오는 대로 먼저 알려드려요.</p>
                <button className="btn block" disabled={waitlist.includes(p.id)} onClick={() => { if (!user) return nav(`/login?next=/products/${p.id}`); setWl(true) }}>{waitlist.includes(p.id) ? '대기 명단에 등록됨' : '대기 명단 등록 · 입고 알림 받기'}</button>
                <Link to="/products/dehumidifier-10" className="link">비슷한 상품 지금 빌리기 → 제습기 10L</Link>
              </div>
            ) : (
              <>
                {p.weekly && (
                  <div className="stack gap-8"><b>빌리는 방식</b>
                    <div className="grid g2" style={{ gap: 8 }}>
                      <button className={`opt ${mode === 'long' ? 'on' : ''}`} onClick={() => setMode('long')}><b>장기</b><small>2개월부터</small></button>
                      <button className={`opt ${mode === 'short' ? 'on' : ''}`} onClick={() => setMode('short')}><b>1주 단기</b><small>거점 보관함 수령</small></button>
                    </div>
                  </div>
                )}
                {mode === 'long' ? (
                  <>
                    <div className="stack gap-8"><b>상태</b>
                      <div className={p.monthly.value != null ? 'grid g2' : 'grid'} style={{ gap: 8 }}>
                        <button className={`opt ${grade === 'standard' ? 'on' : ''}`} onClick={() => setGrade('standard')}><b>일반형</b><small>{p.bought.standard} 매입 · {usedFor(p.bought.standard)} 사용</small><small>월 {won(p.monthly.standard)}</small></button>
                        {p.monthly.value != null && <button className={`opt ${grade === 'value' ? 'on' : ''}`} onClick={() => setGrade('value')}><b>실속형</b><small>{p.bought.value} 매입 · {usedFor(p.bought.value)} 사용</small><small>월 {won(p.monthly.value)}</small></button>}
                      </div>
                    </div>
                    <div className="stack gap-8"><b>기간</b>
                      <div className={customMonths ? 'grid g2' : 'grid'} style={{ gap: 8 }}>
                        <select className="input" value={customMonths ? 'custom' : months} onChange={(e) => {
                          if (e.target.value === 'custom') { setCustomMonths(true); setMonthsText(String(months)) }
                          else { setCustomMonths(false); setMonths(Number(e.target.value)) }
                        }}>
                          {Array.from({ length: 11 }, (_, i) => i + 2).map((m) => <option key={m} value={m}>{m}개월</option>)}
                          <option value="custom">직접 입력</option>
                        </select>
                        {customMonths && (
                          <div className="row gap-8" style={{ alignItems: 'center' }}>
                            <input className="input" type="number" inputMode="numeric" min={2} max={36} value={monthsText} placeholder="2~36"
                              onChange={(e) => { setMonthsText(e.target.value); const n = parseInt(e.target.value, 10); if (n >= 2 && n <= 36) setMonths(n) }}
                              onBlur={() => setMonthsText(String(months))} />
                            <span style={{ whiteSpace: 'nowrap' }}>개월</span>
                          </div>
                        )}
                      </div>
                      <span className="faint" style={{ fontSize: 12 }}>1개월 단위 연장 가능 · 일찍 반납해도 고른 기간 요금은 그대로예요{p.shortFirst ? ` · 4개월 미만이면 첫 달 ${won(p.shortFirst)} (새 필터)` : ''}</span>
                    </div>
                  </>
                ) : (
                  <div className="stack gap-8"><b>기간</b>
                    <div className="grid g2" style={{ gap: 8 }}>
                      {[1, 2].map((w) => <button key={w} className={`opt ${weeks === w ? 'on' : ''}`} onClick={() => setWeeks(w)}><b>{w}주</b><small>{won(w === 1 ? p.weekly!.w1 : p.weekly!.w2)}</small></button>)}
                    </div>
                  </div>
                )}
                <div className="stack gap-8"><b>파손 케어 <span className="faint" style={{ fontWeight: 400, fontSize: 12 }}>선택 · 2단계</span></b>
                  <div className="grid g3" style={{ gap: 8, gridTemplateColumns: 'repeat(3,1fr)' }}>
                    {PLANS.map((x) => (
                      <button key={x.key} className={`opt ${plan === x.key ? 'on' : ''}`} onClick={() => setPlan(x.key)} style={{ textAlign: 'left' }}>
                        <b>{x.name}{x.key === 'full' ? ' · 추천' : ''}</b>
                        <small>월 {won(careOf(x.key))}{x.rate ? ` (공식몰가의 ${x.rate}%)` : ''}</small>
                        <small style={{ color: 'var(--ink)', fontWeight: 700, marginTop: 4 }}>과실 파손 수리비 {x.repairShare}%</small>
                      </button>
                    ))}
                  </div>
                  <span className="faint" style={{ fontSize: 12 }}>{planOf(plan).desc} · 2cm 이하 생활 마모는 케어 없이도 0원 · 고의 파손은 케어 제외</span>
                </div>
                <div className="stack gap-4" style={{ border: '1px solid var(--ink)', padding: '14px 16px' }}>
                  <b style={{ fontSize: 14 }}>신청 전 총비용 · {won(total + fee + careSum)}</b>
                  <span className="faint" style={{ fontSize: 12 }}>{months}개월 대여료 {won(total)} + 배송·회수 {fee ? won(fee) : '0원 (월 3만원 이상)'}{careSum ? ` + ${planOf(plan).name} 케어 ${won(careSum)}` : ''} · 쿠폰 전 금액</span>
                </div>
                <div style={{ background: 'var(--peach)', padding: 18 }} className="stack gap-8">
                  <div className="row gap-8"><span className="badge orange">AI</span><span className="eyebrow">Saving report</span></div>
                  <div className="kv"><span>새로 사기</span><b>{won(p.newPrice)}</b></div>
                  <div className="kv"><span>{mode === 'long' ? `${months}개월 빌리기` : `${weeks}주 빌리기`}</span><b>{won(total)}</b></div>
                  <b style={{ fontSize: 15 }}>{won(saved)} 아끼고, 다 쓰면 반납하면 끝이에요</b>
                </div>
                <div className="stack gap-8">
                  <button className="btn block" onClick={() => add(true)}>빌리기</button>
                  <button className="btn line block" onClick={() => add(false)}>꾸러미에 담기</button>
                </div>
                <div className="grid g3" style={{ gap: 8, gridTemplateColumns: 'repeat(3,1fr)', fontSize: 12, textAlign: 'center' }}>
                  <span className="muted">주 2회 지정일 배송</span><span className="muted">세척 · 정비 기록</span><span className="muted">연장 · 교체</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="grid g2" style={{ gap: 24 }}>
          <div className="panel stack gap-16">
            <div className="row gap-8"><span className="badge orange">AI</span><b>많이 빌린 이유 · 리뷰 분석</b></div>
            {p.reasons.map(([r, pct]) => (
              <div key={r} className="stack gap-4"><div className="kv"><span>{r}</span><b className="num" style={{ fontSize: 22 }}>{pct}%</b></div><Bar pct={pct * 2} orange={pct >= 40} /></div>
            ))}
          </div>
          <div className="panel stack gap-16">
            <div className="row gap-8"><span className="badge orange">AI</span><b>후기 요약</b></div>
            <div className="kv"><span>좋았던 점</span><b style={{ textAlign: 'right' }}>{p.review.good}</b></div>
            <div className="kv"><span>아쉬운 점</span><b style={{ textAlign: 'right' }}>{p.review.bad}</b></div>
            <div className="kv"><span>이런 사람에게</span><b style={{ textAlign: 'right' }}>{p.review.who}</b></div>
            <hr className="rule" />
            <p className="serif" style={{ fontSize: 20 }}>“{p.review.quote}”</p>
            <span className="faint" style={{ fontSize: 13 }}>{p.review.who2}</span>
          </div>
        </div>
        <div className="panel" style={{ marginTop: 24 }}>
          <SectionHead en="Specs" title="상세 정보 · 정비 기록" />
          <div className="grid g4" style={{ gap: 12 }}>{[...p.specs, ['매입일', p.monthly.value != null ? `일반형 ${p.bought.standard} · 실속형 ${p.bought.value}` : `${p.bought.standard}`] as [string, string]].map(([a, b]) => <div key={a} className="stack gap-4" style={{ background: 'var(--surface)', padding: 18 }}><span className="faint" style={{ fontSize: 12 }}>{a}</span><b>{b}</b></div>)}</div>
          <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>소모품: {p.consumable}</p>
        </div>
        <div className="panel stack gap-16" style={{ marginTop: 24 }}>
          <SectionHead en="Device history" title="이 기기 이력 (기기마다 QR)" oneLine />
          <div className="grid g4" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
            {[['실제 사진', '출고 사진 4장 · 기존 흠집 2곳 표시'], ['매입', `${p.bought[grade]} · ${p.source}`], ['최근 세척 · 정비', p.specs.find(([a]) => a === '최근 정비')?.[1] ?? '—'], ['작동 점검', '통과'], ['수리 이력', '없음']].map(([a, b]) => (
              <div key={a} className="stack gap-4" style={{ background: 'var(--surface)', padding: 16 }}><span className="faint" style={{ fontSize: 12 }}>{a}</span><b style={{ fontSize: 14 }}>{b}</b></div>
            ))}
          </div>
          <b>파손 · 고장 처리 기준 (신청 전 안내)</b>
          <div className="scroll-x"><table className="table" style={{ minWidth: 820 }}>
            <thead><tr><th>원인</th><th>예시</th><th>처리</th>{PLANS.map((x) => <th key={x.key} style={plan === x.key ? { color: 'var(--ink)' } : undefined}>{x.name}{plan === x.key ? ' (선택)' : ''}</th>)}</tr></thead>
            <tbody>{([
              ['자연 고장', '정상 사용 중 멈춤', '교체품 제공 · 고장 기간 대여료 차감', () => '0원'],
              ['생활 마모', '2cm 이하 긁힘 · 사용감', '세척 · 정비로 처리', () => '0원'],
              ['소모품', '필터', '정기 교체 (요금 포함)', () => '0원'],
              ['과실 파손', '떨어뜨림 · 침수 · 2cm 넘는 흠', '수리 또는 부품 교체', (x) => `수리비 ${x.repairShare}%`],
              ['분실 · 도난', '기기 분실 · 도난', '잔존가치 기준 보상', (x) => `잔존가치 ${x.lossShare}%`],
              ['고의 훼손', '일부러 부숨', '케어 제외', () => '잔존가치 100%'],
            ] as [string, string, string, (x: (typeof PLANS)[number]) => string][]).map((r) => <tr key={r[0]}><td><b>{r[0]}</b></td><td className="muted">{r[1]}</td><td>{r[2]}</td>{PLANS.map((x) => <td key={x.key} style={plan === x.key ? { fontWeight: 700 } : undefined}>{r[3](x)}</td>)}</tr>)}</tbody>
          </table></div>
          <span className="faint" style={{ fontSize: 12 }}>수리비 %는 실제 수리비 기준이고 잔존가치가 상한이에요. 예: 수리비 10만 원 → 베이직 5만 원 · 프리미엄 2만 원.</span>
          <span className="faint" style={{ fontSize: 12 }}>반납 때 AI가 출고 · 반납 사진을 비교해 달라진 부분을 표시하고, 운영자가 작동 테스트와 함께 최종 판정해요. 받은 날 사진에 있던 흠은 책임에서 빠져요.</span>
        </div>
      </section>

      {wl && (
        <Modal onClose={() => setWl(false)}>
          <h3 className="serif" style={{ fontSize: 24, marginBottom: 8 }}>대기 명단 등록</h3>
          <p className="muted" style={{ marginBottom: 16 }}>원하는 시작일과 상태를 알려주세요.</p>
          <div className="stack gap-12">
            <div className="chips">{['이번 달', '다음 달', '상관없음'].map((x, i) => <span key={x} className={`chip ${i === 0 ? 'on' : ''}`}>{x}</span>)}</div>
            <div className="chips">{['일반형', '실속형', '상관없음'].map((x, i) => <span key={x} className={`chip ${i === 2 ? 'on' : ''}`}>{x}</span>)}</div>
            <button className="btn block" onClick={() => { joinWaitlist(p.id); setWl(false); flash('대기 명단에 올렸어요. 입고되면 알려드릴게요') }}>등록하기</button>
          </div>
        </Modal>
      )}
      <Toast msg={toast} />
      {!sold && <div style={{ display: 'none' }}>{Icon.arrow}</div>}
    </>
  )
}
