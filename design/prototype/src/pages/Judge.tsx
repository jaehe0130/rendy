import { useState } from 'react'
import { Link } from 'react-router-dom'
import { planOf, productById, won, type PlanKey } from '../data'
import { Illust, Toast } from '../components'

// 운영자 반납 최종 판정 (기능명세서 DMG-05 · ADM-03). AI는 흠집 후보만 표시하고, 판정은 운영자가 한다.
// 예시 데이터 — 실제로는 출고 6면 · 받은 날 3장 · 반납 3장 사진과 AI 비교 결과가 들어온다.

type Cat = '생활 마모' | '과실 파손' | '자연 고장'
type Conf = '높음' | '중간' | '낮음'
interface Mark { face: string; x: number; y: number; w: number; h: number; cm: number }
interface Case {
  id: string; productId: string; who: string; plan: PlanKey; released: string; lifeMonths: number
  aiCat: Cat | '변화 없음'; conf: Conf; marks: Mark[]; note: string; repair: number
}

const REVIEW_MARGIN_CM = 0.5 // 2cm 기준 ± 이 안이면 AI 분류를 믿지 않고 운영자 확인 (실험 길이 오차 평균 약 1.5cm)
const FACES = ['정면', '옆면', '작동 화면']

const CASES: Case[] = [
  { id: 'J-1103', productId: 'humidifier', who: '이○○ · 정릉동', plan: 'safe', released: '2025.03', lifeMonths: 60, aiCat: '변화 없음', conf: '낮음', marks: [], note: '반납 사진 반사광이 심해 비교 실패', repair: 0 },
  { id: 'J-1101', productId: 'dehumidifier-10', who: '김○○ · 돈암동', plan: 'full', released: '2025.04', lifeMonths: 60, aiCat: '생활 마모', conf: '중간', marks: [{ face: '옆면', x: 58, y: 40, w: 22, h: 8, cm: 1.6 }], note: '옆면 긁힘 1.6cm', repair: 0 },
  { id: 'J-1102', productId: 'mini-dryer', who: '박○○ · 안암동', plan: 'basic', released: '2024.11', lifeMonths: 48, aiCat: '과실 파손', conf: '높음', marks: [{ face: '정면', x: 18, y: 62, w: 30, h: 12, cm: 3.4 }], note: '정면 아래 모서리 깨짐 3.4cm', repair: 60000 },
]
const confRank: Record<Conf, number> = { 낮음: 0, 중간: 1, 높음: 2 }

function residual(c: Case) {
  const [y, m] = c.released.split('.').map(Number)
  const now = new Date()
  const used = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
  const p = productById(c.productId)!
  return Math.round((p.newPrice * Math.max(0, 1 - used / c.lifeMonths)) / 1000) * 1000
}
// 고객 부담 (부록 C-7): 과실 파손만 부담, 단계별로 다름. 상한 = 잔존가치
function burden(cat: Cat, plan: PlanKey, repair: number, cap: number) {
  if (cat !== '과실 파손') return 0
  const r = Math.min(repair, cap)
  return plan === 'full' ? 0 : plan === 'safe' ? Math.min(r, 10000) : r
}

export default function Judge() {
  const queue = [...CASES].sort((a, b) => confRank[a.conf] - confRank[b.conf])
  const [sel, setSel] = useState(queue[0].id)
  const [done, setDone] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')
  const c = queue.find((x) => x.id === sel)!
  const p = productById(c.productId)!
  const near = c.marks.some((m) => Math.abs(m.cm - 2) <= REVIEW_MARGIN_CM)
  const [cat, setCat] = useState<Cat>(c.aiCat === '변화 없음' ? '생활 마모' : c.aiCat)
  const [works, setWorks] = useState(true)
  const [repair, setRepair] = useState(c.repair)
  const [reason, setReason] = useState('')
  const pick = (id: string) => { const n = queue.find((x) => x.id === id)!; setSel(id); setCat(n.aiCat === '변화 없음' ? '생활 마모' : n.aiCat); setRepair(n.repair); setReason(''); setWorks(true) }
  const cap = residual(c)
  const pay = burden(cat, c.plan, repair, cap)
  const differs = c.aiCat !== '변화 없음' && cat !== c.aiCat
  const confirm = () => { setDone({ ...done, [c.id]: `${cat} · ${won(pay)}` }); setToast('판정 확정 · 고객에게 알림(이의 48시간) · 학습 데이터 저장'); setTimeout(() => setToast(''), 1600) }

  return (
    <section className="section bg-surface judge">
      <div className="row between wrap-row gap-16" style={{ marginBottom: 20 }}>
        <div className="stack gap-4"><span className="eyebrow">Admin</span><h1 className="serif" style={{ fontSize: 'clamp(28px,4vw,40px)' }}>반납 최종 판정</h1></div>
        <Link to="/admin" className="btn line sm">대시보드</Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,280px) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        {/* 판정 대기 목록: 신뢰도 낮은 것부터 */}
        <div className="panel stack gap-8" style={{ padding: 16 }}>
          <b style={{ fontSize: 14 }}>판정 대기 {queue.filter((x) => !done[x.id]).length}건</b>
          {queue.map((x) => (
            <button key={x.id} onClick={() => pick(x.id)} className="stack gap-4" style={{ textAlign: 'left', padding: 12, border: `1px solid ${x.id === sel ? 'var(--ink)' : 'var(--line)'}`, background: 'var(--white)', borderRadius: 4 }}>
              <div className="row between"><b style={{ fontSize: 14 }}>{productById(x.productId)!.name}</b>{done[x.id] ? <span className="badge">확정</span> : <span className={`badge ${x.conf === '낮음' ? 'orange' : 'soft'}`}>신뢰도 {x.conf}</span>}</div>
              <span className="faint" style={{ fontSize: 12 }}>AI: {x.aiCat}{x.marks[0] ? ` · ${x.marks[0].cm}cm` : ''}</span>
            </button>
          ))}
        </div>

        <div className="stack gap-16">
          {/* 사진 비교 */}
          <div className="panel stack gap-12">
            <div className="row between wrap-row gap-8">
              <b>{p.name} · {c.who}</b>
              <div className="row gap-8"><span className="badge solid">AI {c.aiCat}</span>{near && <span className="badge orange">2cm 근처 · 운영자 확인</span>}{c.conf === '낮음' && <span className="badge orange">사진 다시 확인</span>}</div>
            </div>
            <div className="scroll-x">
              <table className="table" style={{ minWidth: 560 }}>
                <thead><tr><th>면</th><th>출고</th><th>받은 날</th><th>반납</th></tr></thead>
                <tbody>{FACES.map((f) => {
                  const m = c.marks.find((x) => x.face === f)
                  return (
                    <tr key={f}><td style={{ fontSize: 13 }}>{f}</td>
                      {['출고', '받은 날', '반납'].map((k) => (
                        <td key={k}><div style={{ position: 'relative', background: p.bg, display: 'grid', placeItems: 'center', height: 96, borderRadius: 2 }}>
                          <Illust k={p.illust} size={64} />
                          {k === '반납' && m && <div style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%`, border: '2px solid var(--primary)' }} title={`${m.cm}cm`} />}
                          {k === '반납' && m && <span className="badge orange" style={{ position: 'absolute', right: 4, bottom: 4 }}>{m.cm}cm</span>}
                        </div></td>
                      ))}
                    </tr>
                  )
                })}</tbody>
              </table>
            </div>
            <span className="faint" style={{ fontSize: 12 }}>AI 메모: {c.note}</span>
          </div>

          {/* 운영자 판정 */}
          <div className="panel stack gap-12">
            <div className="field"><label>작동 테스트</label><div className="chips">{['정상', '이상'].map((x, i) => <button key={x} className={`chip ${works === !i ? 'on' : ''}`} onClick={() => setWorks(!i)}>{x}</button>)}</div></div>
            <div className="field"><label>최종 분류</label><div className="chips">{(['생활 마모', '과실 파손', '자연 고장'] as Cat[]).map((x) => <button key={x} className={`chip ${cat === x ? 'on' : ''}`} onClick={() => setCat(x)}>{x}</button>)}</div></div>
            {cat === '과실 파손' && <div className="field"><label htmlFor="rp">수리비</label><input id="rp" className="input" inputMode="numeric" value={repair} onChange={(e) => setRepair(+e.target.value.replace(/\D/g, '') || 0)} style={{ maxWidth: 200 }} /></div>}
            {differs && <div className="field"><label htmlFor="rs">AI와 다르게 판정한 사유 (필수)</label><input id="rs" className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 반사광을 흠집으로 봄" /></div>}
            <div className="kv"><span>보장 단계</span><b>{planOf(c.plan).name}</b></div>
            <div className="kv"><span>잔존가치 (부담 상한)</span><b>{won(cap)}</b></div>
            <div className="kv" style={{ fontSize: 18 }}><span>고객 부담</span><b style={{ color: 'var(--primary)' }}>{won(pay)}</b></div>
            <button className="btn block" disabled={!!done[c.id] || (differs && !reason)} onClick={confirm}>{done[c.id] ? `확정됨 · ${done[c.id]}` : '판정 확정'}</button>
          </div>

          {/* AI 성능: 실험값 그대로 */}
          <div className="panel stack gap-8" style={{ padding: 16 }}>
            <b style={{ fontSize: 14 }}>AI 성능 (합성 데이터 실험값)</b>
            <span style={{ fontSize: 13 }}>흠집 찾기 F1 0.73 · 길이 오차 평균 1.5cm · 자동 판정 정확도 57%</span>
            <span className="faint" style={{ fontSize: 12 }}>그래서 AI는 후보 표시까지만, 판정은 운영자가 해요. 확정 결과로 다시 학습해요.</span>
          </div>
        </div>
      </div>
      <Toast msg={toast} />
    </section>
  )
}
