import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, SCHOOLS, planOf, productById, won } from '../data'
import { Bar, Toast } from '../components'
import { useStore } from '../store'

// 예시 운영 지표: 대수·가동률은 데모용 값
const FLEET: Record<string, { total: number; util: number }> = {
  'dehumidifier-10': { total: 14, util: 79 },
  'dehumidifier-16': { total: 8, util: 100 },
  'mini-dryer': { total: 12, util: 58 },
  humidifier: { total: 10, util: 60 },
  foodwaste: { total: 6, util: 67 },
}

export default function Admin() {
  const { rentals, sells, schoolCounts, waitlist, reset } = useStore()
  const [toast, setToast] = useState('')
  const [done, setDone] = useState<Record<string, string>>({})
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 1600) }
  const active = rentals.filter((r) => r.status === '사용 중')
  const mrr = active.filter((r) => r.mode === 'long').reduce((a, r) => a + r.price, 0)
  const totalFleet = Object.values(FLEET).reduce((a, f) => a + f.total, 0)
  const avgUtil = Math.round(Object.values(FLEET).reduce((a, f) => a + f.total * f.util, 0) / totalFleet)
  const schoolTotal = SCHOOLS.reduce((a, s) => a + (schoolCounts[s.name] ?? s.count), 0)
  const intake = [
    ...sells.map((s) => ({ id: s.id, kind: s.kind, item: s.item, amount: s.amount, status: s.status })),
    { id: 'S-demo1', kind: '팔기', item: '가습기', amount: won(42000), status: '검수 대기' },
    { id: 'S-demo2', kind: '팔기', item: '미니 건조기', amount: `${won(128000)} (렌디 이용자 +5%p)`, status: '검수 대기' },
  ]

  return (
    <section className="section bg-surface">
      <div className="row between wrap-row gap-16" style={{ marginBottom: 24 }}>
        <div className="stack gap-4"><span className="eyebrow">Admin</span><h1 className="serif" style={{ fontSize: 34 }}>운영 대시보드</h1></div>
        <div className="row gap-8"><Link to="/admin/judge" className="btn sm">반납 판정 3건</Link>
        <button className="btn line sm" onClick={() => { reset(); setDone({}); flash('데모 데이터를 초기화했어요') }}>데모 초기화</button></div>
      </div>

      <div className="grid g4" style={{ marginBottom: 24 }}>
        {[['사용 중 렌탈', `${active.length + 41}건`], ['월 반복 매출', won(mrr + 612000)], ['평균 가동률', `${avgUtil}%`], ['학교 인증', `${schoolTotal}명`]].map(([a, b]) => (
          <div key={a} className="panel stack gap-4"><span className="muted" style={{ fontSize: 13 }}>{a}</span><span className="num" style={{ fontSize: 40 }}>{b}</span></div>
        ))}
      </div>

      <div className="panel stack gap-12" style={{ marginBottom: 24 }}>
        <div className="row between wrap-row"><h2 className="serif" style={{ fontSize: 22 }}>재고 · 가동률 · 대기</h2><span className="faint" style={{ fontSize: 12 }}>규칙: 가동률 85% 이상 2주 + 대기가 보유 대수의 10% 이상 → 추가 매입 · 바이백 모집</span></div>
        <div className="scroll-x"><table className="table" style={{ minWidth: 720 }}>
          <thead><tr><th>품목</th><th>보유</th><th>대여 가능</th><th>가동률</th><th>대기</th><th>조치</th></tr></thead>
          <tbody>{PRODUCTS.map((p) => {
            const f = FLEET[p.id]
            const wait = p.waitlist + (waitlist.includes(p.id) ? 1 : 0)
            const need = f.util >= 90 && wait >= 5
            return (
              <tr key={p.id}>
                <td><b>{p.name}</b></td><td>{f.total}대</td><td>{p.stock}대</td>
                <td style={{ minWidth: 160 }}><div className="row gap-8"><div style={{ flex: 1 }}><Bar pct={f.util} orange={f.util >= 90} /></div><span>{f.util}%</span></div></td>
                <td>{wait ? `${wait}명` : '-'}</td>
                <td>{need ? (done[p.id] ? <span className="badge">{done[p.id]}</span> : <button className="btn sm accent" onClick={() => { setDone({ ...done, [p.id]: '매입 요청됨' }); flash(`${p.name} 3대 추가 매입을 요청했어요`) }}>추가 매입</button>) : <span className="faint">-</span>}</td>
              </tr>
            )
          })}</tbody>
        </table></div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="panel stack gap-12">
          <h2 className="serif" style={{ fontSize: 22 }}>입고 · 검수 (팔기 · 바이백)</h2>
          <div className="scroll-x"><table className="table" style={{ minWidth: 460 }}>
            <thead><tr><th>구분</th><th>품목</th><th>금액</th><th>처리</th></tr></thead>
            <tbody>{intake.map((s) => (
              <tr key={s.id}><td><span className="badge soft">{s.kind}</span></td><td>{s.item}</td><td>{s.amount}</td>
                <td>{done[s.id] ? <span className="badge">{done[s.id]}</span> : <div className="row gap-4"><button className="btn sm" onClick={() => setDone({ ...done, [s.id]: '입금 완료' })}>통과</button><button className="btn sm line" onClick={() => setDone({ ...done, [s.id]: '반려' })}>반려</button></div>}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>

      <div className="panel stack gap-12" style={{ marginBottom: 24 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>최근 렌탈</h2>
        <div className="scroll-x"><table className="table" style={{ minWidth: 640 }}>
          <thead><tr><th>주문번호</th><th>품목</th><th>기간</th><th>요금</th><th>보장</th><th>상태</th></tr></thead>
          <tbody>{rentals.map((r) => (
            <tr key={r.id}><td className="faint">{r.id}</td><td>{productById(r.productId)!.name}</td><td>{r.start} ~ {r.end}</td><td>{r.mode === 'long' ? `월 ${won(r.price)}` : won(r.price)}</td><td>{planOf(r.plan).name}</td><td><span className={`badge ${r.status === '반납 신청' ? 'orange' : ''}`}>{r.status}</span></td></tr>
          ))}</tbody>
        </table></div>
      </div>

      <div className="panel stack gap-12">
        <h2 className="serif" style={{ fontSize: 22 }}>학교 캠페인</h2>
        <div className="scroll-x"><table className="table" style={{ minWidth: 560 }}>
          <thead><tr><th>학교</th><th>인증</th><th>다음 단계</th><th>달성 리워드</th></tr></thead>
          <tbody>{SCHOOLS.map((s) => {
            const n = schoolCounts[s.name] ?? s.count
            const next = [100, 200, 300].find((g) => n < g)
            const got = [n >= 100 && '연장 쿠폰', n >= 200 && '대기 우선', n >= 300 && '완전 안심 3개월'].filter(Boolean).join(' · ')
            return <tr key={s.name}><td><b>{s.name}</b></td><td>{n}명</td><td>{next ? `${next}명까지 ${next - n}명` : '전 단계 달성'}</td><td>{got || '-'}</td></tr>
          })}</tbody>
        </table></div>
      </div>
      <p className="demo-note" style={{ marginTop: 16 }}>프로토타입: 보유 대수 · 가동률 · 매출 일부는 예시 값이에요. 이 화면에서 한 주문 · 팔기는 실제로 반영돼요.</p>
      <Toast msg={toast} />
    </section>
  )
}
