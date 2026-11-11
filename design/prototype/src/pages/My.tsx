import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { PRODUCTS, gradeFor, lowest, planOf, priceOf, productById, won, type Product } from '../data'
import { Bar, Modal, Toast, ProductArt } from '../components'
import { ReturnCompare } from '../ReturnCompare'
import { useStore, dday, iso, addDays, addMonths, type Rental } from '../store'

export function Upload({ label, onFile }: { label: string; onFile?: (f: File) => void }) {
  const [url, setUrl] = useState('')
  return (
    <label className="upload">
      {url ? <img src={url} alt={label} /> : <span>+ {label}</span>}
      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUrl(URL.createObjectURL(f)); onFile?.(f) } }} />
    </label>
  )
}

export default function My() {
  const { user, rentals, coupons, sells, waitlist, extendRental, requestReturn, swapRental, reset } = useStore()
  // ?open=extend | return | receive 이면 그 팝업을 열어 둔 채로 시작 (시안 캡처·시연용)
  const openQ = new URLSearchParams(location.search).get('open')
  const [ext, setExt] = useState<Rental | null>(openQ === 'extend' ? rentals[0] ?? null : null)
  const [extM, setExtM] = useState(1)
  const [ret, setRet] = useState<Rental | null>(openQ === 'return' ? rentals[0] ?? null : null)
  const [judge, setJudge] = useState<'idle' | 'loading' | 'done'>('idle')
  const [toast, setToast] = useState('')
  const [checked, setChecked] = useState<string[]>([]) // 받은 날 상태 확인을 마친 렌탈
  const [recv, setRecv] = useState<Rental | null>(openQ === 'receive' ? rentals[1] ?? rentals[0] ?? null : null)
  const [recvPhotos, setRecvPhotos] = useState(0)
  const [swap, setSwap] = useState<Rental | null>(null)
  // /my#sells 로 들어오면 팔기 내역으로 (화면 맨 위로 올리는 Layout 다음에 실행되게 살짝 늦춤)
  const { hash } = useLocation()
  useEffect(() => { if (hash === '#sells') setTimeout(() => document.getElementById('sells')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80) }, [hash])
  if (!user) return <Navigate to="/login?next=/my" replace />
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 1800) }
  const active = rentals.filter((r) => r.status !== '회수 완료')
  const newest = active.filter((r) => r.status === '사용 중' && !checked.includes(r.id)).sort((a, b) => b.start.localeCompare(a.start))[0]
  const closeRet = () => { setRet(null); setJudge('idle') }
  const newEnd = ext ? iso(addMonths(addDays(new Date(ext.end), 1), extM)) : ''

  return (
    <section className="section bg-surface">
      <div className="split" style={{ gridTemplateColumns: 'min(280px,100%) minmax(0,1fr)' }}>
        <aside className="panel stack gap-12">
          <b style={{ fontSize: 18 }}>{user.name} 님</b>
          <div className="row gap-8 wrap-row"><span className="badge solid">본인인증 ✓</span>{user.school ? <span className="badge">{user.school} ✓</span> : <Link to="/school" className="badge orange">학교 인증하기</Link>}</div>
          <hr className="rule" />
          <b style={{ fontSize: 14 }}>쿠폰함 {coupons.filter((c) => !c.used).length}</b>
          {coupons.length === 0 && <span className="faint" style={{ fontSize: 13 }}>학교 인증하면 첫 달 50% 쿠폰을 드려요.</span>}
          {coupons.map((c) => <span key={c.id} className="faint" style={{ fontSize: 13, textDecoration: c.used ? 'line-through' : 'none' }}>· {c.title}</span>)}
          <hr className="rule" />
          <b style={{ fontSize: 14 }}>대기 명단 {waitlist.length}</b>
          {waitlist.map((id) => <span key={id} className="faint" style={{ fontSize: 13 }}>· {productById(id)?.name} (입고 알림 대기)</span>)}
          <hr className="rule" />
          <a href="#sells" style={{ fontSize: 14, fontWeight: 700 }}>팔기 내역 {sells.length} ›</a>
          <hr className="rule" />
          <button className="faint" style={{ background: 'none', border: 0, fontSize: 12, textAlign: 'left' }} onClick={() => { reset(); flash('데모 데이터를 처음 상태로 돌렸어요') }}>데모 초기화</button>
        </aside>
        <div className="stack gap-16">
          <div className="row between wrap-row"><h1 className="serif" style={{ fontSize: 34 }}>내 렌탈</h1><span className="muted">사용 중 {active.filter((r) => r.status === '사용 중').length}대</span></div>
          {newest && (
            <div className="row gap-16 wrap-row" style={{ background: 'var(--peach)', padding: '16px 20px' }}>
              <div className="stack gap-4" style={{ flex: 1, minWidth: 240 }}>
                <b>{productById(newest.productId)!.name} 받으셨나요? 받은 날 사진 3장으로 상태를 확인해 주세요</b>
                <span className="faint" style={{ fontSize: 13 }}>정면 · 옆면 · 전원 ON 사진 · 24시간 안에 이상을 알려주면 무상 교체 · 이 사진에 있던 흠은 반납 때 책임에서 빠져요</span>
              </div>
              <button className="btn sm" onClick={() => { setRecv(newest); setRecvPhotos(0) }}>사진 올리기</button>
            </div>
          )}
          {active.map((r) => {
            const p = productById(r.productId)!
            const total = (new Date(r.end).getTime() - new Date(r.start).getTime()) / 86400000
            const passed = (Date.now() - new Date(r.start).getTime()) / 86400000
            const d = dday(r.end)
            return (
              <div key={r.id} className="panel row gap-24 wrap-row">
                <div style={{ background: p.bg, width: 112, height: 112, display: 'grid', placeItems: 'center' }}><ProductArt p={p} size={84} /></div>
                <div className="stack gap-8" style={{ flex: 1, minWidth: 220 }}>
                  <div className="row gap-8 wrap-row"><b style={{ fontSize: 18 }}>{p.name}</b><span className="badge soft">{r.mode === 'long' ? (r.grade === 'standard' ? '일반형' : '실속형') : '1주 단기'}</span>{r.status !== '사용 중' && <span className="badge solid">{r.status}</span>}<span className={`badge ${d <= 7 ? 'orange' : ''}`}>반납까지 D-{Math.max(0, d)}</span></div>
                  <span className="faint" style={{ fontSize: 13 }}>{r.start} ~ {r.end} · {r.mode === 'long' ? `월 ${won(r.price)}` : won(r.price)}{` · ${r.plan === 'basic' ? '파손 케어 없음' : `${planOf(r.plan).name} 케어`}`} · {p.bought[r.grade]} 매입</span>
                  <Bar pct={(passed / total) * 100} orange={d <= 23} />
                  {r.mode === 'long' && <span className="faint" style={{ fontSize: 12 }}>소모품 교체 예정: {p.consumable}</span>}
                </div>
                {r.status === '사용 중' && (
                  <div className="stack gap-8" style={{ width: 150 }}>
                    {r.mode === 'long' && <button className="btn sm" onClick={() => setExt(r)}>연장하기</button>}
                    <button className="btn line sm" onClick={() => setSwap(r)}>다른 걸로 교체</button>
                    <button className="btn line sm" onClick={() => setRet(r)}>반납 신청</button>
                  </div>
                )}
              </div>
            )
          })}
          <SellList />
          <Link to="/sell" className="row between wrap-row gap-16 bg-ink" style={{ padding: '28px 32px' }}>
            <div className="stack gap-4"><b style={{ fontSize: 20 }}>이사 · 입대 · 유학으로 떠나세요?</b><span style={{ color: 'var(--ink-3)', fontSize: 14 }}>쓰던 가전을 렌디에 팔면, 렌디 이용자는 매입가 +5%p를 더 받아요.</span></div>
            <span className="btn accent">팔기</span>
          </Link>
        </div>
      </div>

      {ext && (
        <Modal onClose={() => setExt(null)}>
          <h3 className="serif" style={{ fontSize: 26, marginBottom: 6 }}>기간 연장</h3>
          <p className="muted" style={{ marginBottom: 16 }}>{productById(ext.productId)!.name} · 지금 반납일 {ext.end}</p>
          <b style={{ fontSize: 14 }}>1개월 단위 연장 · 연장 쿠폰 적용</b>
          <div className="grid g3" style={{ gap: 8, gridTemplateColumns: 'repeat(3,1fr)', margin: '8px 0 16px' }}>{[1, 2, 3].map((m) => <button key={m} className={`opt ${extM === m ? 'on' : ''}`} onClick={() => setExtM(m)}><b>+{m}개월</b></button>)}</div>
          <div className="stack gap-8" style={{ background: 'var(--surface)', padding: 16, marginBottom: 16 }}>
            <div className="kv"><span>새 반납일</span><b>{newEnd}</b></div>
            <div className="kv"><span>추가 결제</span><b>{`월 ${won(ext.price)} × ${extM}`}</b></div>
            <div className="kv"><span>연장 혜택</span><b>소모품 무료 교체</b></div>
          </div>
          <div className="row gap-8"><button className="btn line" onClick={() => setExt(null)}>취소</button><button className="btn" style={{ flex: 1 }} onClick={() => { extendRental(ext.id, extM); setExt(null); flash('연장됐어요. 다음 결제일부터 반영돼요') }}>연장하기</button></div>
        </Modal>
      )}

      {ret && (
        <Modal onClose={closeRet}>
          {judge !== 'done' ? (
            <div className="stack gap-12">
              <h3 className="serif" style={{ fontSize: 26 }}>반납 신청</h3>
              <p className="muted" style={{ fontSize: 14 }}>{productById(ret.productId)!.name} · 일찍 반납해도 처음 고른 기간의 요금은 그대로예요.</p>
              <div className="field"><label>회수 날짜</label><div className="chips">{['다음 배송일 (화)', '그다음 (금)'].map((x, i) => <span key={x} className={`chip ${i === 0 ? 'on' : ''}`}>{x}</span>)}</div></div>
              <b style={{ fontSize: 14 }}>반납 사진 · AI가 출고 사진과 비교해요</b>
              {/* 실제 흠집 모델로 출고 사진(렌디 촬영) ↔ 반납 사진 비교 → 예비 판정 후 반납 확정 */}
              <ReturnCompare key={ret.id} plan={ret.plan} kits={[ret.productId]} lockOutbound actions={() => (
                <div className="row gap-8"><button className="btn line" onClick={() => { closeRet(); flash('이의 신청을 접수했어요. 3영업일 안에 다시 판정해요') }}>이의 신청</button><button className="btn" style={{ flex: 1 }} onClick={() => { requestReturn(ret.id); closeRet(); flash('반납 신청 완료. 회수 후 운영자가 최종 판정해요') }}>반납 확정</button></div>
              )} />
            </div>
          ) : (
            <div className="stack gap-12">
              <div className="row gap-8"><span className="badge orange">AI</span><h3 className="serif" style={{ fontSize: 26 }}>AI 사진 비교 · 예비 판정</h3></div>
              {['정면', '옆면', '전원 ON 사진'].map((x, i) => (
                <div key={x} className="kv"><span>{x} (출고 → 지금)</span><b style={{ color: i === 1 ? 'var(--primary)' : undefined }}>{i === 1 ? '긁힘 1.5cm 새로 발견 → 생활 마모' : '변화 없음'}</b></div>
              ))}
              <div style={{ background: 'var(--surface)', padding: 18 }} className="stack gap-4">
                <span className="badge solid" style={{ alignSelf: 'flex-start' }}>예비 판정: 생활 마모</span>
                <b className="serif" style={{ fontSize: 30, color: 'var(--success)' }}>예상 부담 0원</b>
                <span className="faint" style={{ fontSize: 13 }}>2cm 이하 긁힘·찍힘은 생활 마모라 0원이에요. 과실 파손은 파손 케어에 따라 수리비 100%(케어 없음) · 베이직 50% · 프리미엄 20%예요 (잔존가치 한도). 회수 후 운영자가 작동 테스트와 함께 최종 판정하고, 결과를 받은 뒤 48시간 안에 이의 신청할 수 있어요.</span>
              </div>
              <div className="row gap-8"><button className="btn line" onClick={() => { closeRet(); flash('이의 신청을 접수했어요. 3영업일 안에 다시 판정해요') }}>이의 신청</button><button className="btn" style={{ flex: 1 }} onClick={() => { requestReturn(ret.id); closeRet(); flash('반납 신청 완료. 회수 날 가져갈게요') }}>반납 확정</button></div>
              <span className="demo-note">프로토타입: 판정 결과는 예시예요. 실제로는 출고 때 찍은 사진과 AI가 부위별로 비교하고, 최종 판정은 운영자가 해요.</span>
            </div>
          )}
        </Modal>
      )}
      {swap && (
        <Modal onClose={() => setSwap(null)}>
          <div className="stack gap-12">
            <h3 className="serif" style={{ fontSize: 26 }}>다른 가전으로 교체</h3>
            <p className="muted" style={{ fontSize: 14 }}>{productById(swap.productId)!.name} · 남은 기간({swap.end}까지) 그대로, 다음 배송일(화·금)에 가져가면서 바꿔 드려요.</p>
            {swapOptions(productById(swap.productId)!).map((np) => {
              const g = gradeFor(np, swap.grade)
              const diff = priceOf(np, g) - swap.price
              return (
                <div key={np.id} className="swap-opt">
                  <div style={{ background: np.bg }}><ProductArt p={np} size={64} /></div>
                  <div className="stack" style={{ flex: 1, minWidth: 0 }}>
                    <b>{np.name}</b>
                    <span className="faint" style={{ fontSize: 12 }}>{np.reasons[0][0]}</span>
                    <span style={{ fontSize: 13 }}>월 {won(priceOf(np, g))} <span className="faint">({diff === 0 ? '지금과 같아요' : diff > 0 ? `+${won(diff)}` : `−${won(-diff)}`})</span></span>
                  </div>
                  <button className="btn sm" onClick={() => { swapRental(swap.id, np.id); setSwap(null); flash(`${np.name}(으)로 교체 신청했어요. 다음 배송일에 바꿔 드려요`) }}>이걸로 교체</button>
                </div>
              )
            })}
            <span className="faint" style={{ fontSize: 12 }}>교체 배송·회수는 한 번에 처리해서 배송비가 따로 들지 않아요 · 월 요금은 다음 결제일부터 바뀌어요</span>
          </div>
        </Modal>
      )}
      {recv && (
        <Modal onClose={() => setRecv(null)}>
          <div className="stack gap-12">
            <h3 className="serif" style={{ fontSize: 26 }}>받은 날 상태 확인</h3>
            <p className="muted" style={{ fontSize: 14 }}>{productById(recv.productId)!.name} · {recv.start} 받음 · 24시간 안에 올려 주세요</p>
            <div className="grid g3" style={{ gap: 8, gridTemplateColumns: 'repeat(3,1fr)' }}>{['정면', '옆면', '전원 ON 사진'].map((x) => <Upload key={x} label={x} onFile={() => setRecvPhotos((n) => n + 1)} />)}</div>
            <label className="row gap-8" style={{ fontSize: 14 }}><input type="checkbox" /> 이상이 있어요 (다음 배송일에 무상 교체)</label>
            <button className="btn block" disabled={recvPhotos < 3} onClick={() => { setChecked((c) => [...c, recv.id]); setRecv(null); flash('상태를 기록했어요. 이 사진에 있던 흠은 반납 때 책임에서 빠져요') }}>{`상태 기록하기 (${Math.min(recvPhotos, 3)}/3)`}</button>
          </div>
        </Modal>
      )}
      <Toast msg={toast} />
    </section>
  )
}

// 교체 후보 2개: 같은 종류에서 지금 빌릴 수 있는 것 먼저, 모자라면 다른 종류에서 (지금 빌린 것 · 품절 제외)
function swapOptions(cur: Product) {
  const ok = PRODUCTS.filter((x) => x.id !== cur.id && x.stock > 0)
  return [...ok.filter((x) => x.category === cur.category), ...ok.filter((x) => x.category !== cur.category).sort((a, b) => lowest(a) - lowest(b))].slice(0, 2)
}

// 팔기 내역: 수거 예약 → 수거 · 검수 → 입금 (데모는 첫 단계)
const SELL_STEPS = ['수거 예약', '수거 · 검수', '입금 완료']
function SellList() {
  const { sells } = useStore()
  return (
    <div id="sells" className="panel stack gap-12">
      <div className="row between wrap-row"><b style={{ fontSize: 20 }}>팔기 내역</b><span className="muted" style={{ fontSize: 13 }}>{sells.length}건</span></div>
      {sells.length === 0 ? (
        <div className="row between wrap-row gap-12">
          <span className="faint" style={{ fontSize: 14 }}>아직 판 가전이 없어요. 팔기에서 수거를 신청하면 여기서 진행 상황을 볼 수 있어요.</span>
          <Link to="/sell" className="btn line sm">팔기</Link>
        </div>
      ) : sells.map((s) => (
        <div key={s.id} className="sell-row">
          <div className="row between wrap-row gap-8"><b>{s.item}</b><span className="faint" style={{ fontSize: 12 }}>{s.date} 신청 · {s.id}</span></div>
          <div className="kv"><span>예상 매입가</span><b style={{ color: 'var(--primary)' }}>{s.amount}</b></div>
          <div className="sell-steps">{SELL_STEPS.map((x, i) => <span key={x} className={i === 0 ? 'on' : ''}>{x}</span>)}</div>
          <span className="faint" style={{ fontSize: 12 }}>다음 배송일(화·금)에 문 앞에서 무료로 가져가요 · 검수 끝나면 최종가를 사진과 함께 알려드리고 바로 입금해요</span>
        </div>
      ))}
    </div>
  )
}
