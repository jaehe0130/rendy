import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SCHOOLS, PRODUCTS, won } from '../data'
import { Bar, ProductCard, SectionHead } from '../components'
import { useStore } from '../store'

const GOAL = 300

export default function School() {
  const { user, schoolCounts, verifySchool, coupons } = useStore()
  const nav = useNavigate()
  const [school, setSchool] = useState(SCHOOLS[0].name)
  const [id, setId] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [invite, setInvite] = useState('')
  const dom = SCHOOLS.find((s) => s.name === school)!.domain
  const verified = !!user?.school
  const myCount = verified ? schoolCounts[user!.school!] : 0
  const nextGoal = [100, 200, 300].find((g) => myCount < g) ?? 300

  if (verified)
    return (
      <>
        <section className="section bg-surface">
          <div className="split">
            <div className="panel stack gap-16">
              <span className="eyebrow">Verified</span>
              <h1 className="serif" style={{ fontSize: 'clamp(30px,4vw,40px)' }}>{user!.school} 인증 완료!</h1>
              <div className="row gap-32">
                <div className="stack"><span className="num" style={{ fontSize: 56, color: 'var(--primary)' }}>{myCount}</span><span className="muted" style={{ fontSize: 13 }}>번째 {user!.school} 인증</span></div>
                <div className="stack"><span className="num" style={{ fontSize: 56 }}>{Math.max(0, nextGoal - myCount)}</span><span className="muted" style={{ fontSize: 13 }}>명 더 모이면 다음 학교 리워드</span></div>
              </div>
              <hr className="rule ink" />
              <span className="faint" style={{ fontSize: 13 }}>쿠폰함에 넣어 드렸어요</span>
              {coupons.map((c) => (
                <div key={c.id} className="row gap-16" style={{ border: '1px solid var(--ink)', padding: '16px 18px' }}>
                  <span className="badge orange">쿠폰</span>
                  <div className="stack" style={{ flex: 1 }}><b>{c.title}</b><span className="muted" style={{ fontSize: 13 }}>{c.desc}</span></div>
                  <span style={{ color: c.used ? 'var(--ink-3)' : 'var(--primary)', fontWeight: 600, fontSize: 13 }}>{c.used ? '사용함' : '받음'}</span>
                </div>
              ))}
              <Link to="/products" className="btn block">혜택으로 첫 렌탈 하기</Link>
            </div>
            <div className="panel bg-ink stack gap-16" style={{ background: 'var(--ink)', color: '#fff' }}>
              <span className="eyebrow">Invite friends</span>
              <h2 className="serif" style={{ fontSize: 28 }}>친구가 내 코드로 첫 렌탈을 받으면<br />둘 다 5,000원</h2>
              <div className="row between" style={{ border: '1px solid var(--ink-2)', padding: '16px 18px' }}>
                <span className="num" style={{ fontSize: 32 }}>{user!.inviteCode}</span>
                <button className="btn sm accent" onClick={() => navigator.clipboard?.writeText(user!.inviteCode ?? '').catch(() => {})}>복사</button>
              </div>
              <div className="chips">{['카카오톡', '인스타 스토리', '에브리타임 글'].map((x) => <span key={x} className="chip" style={{ background: 'transparent', color: '#fff', borderColor: 'var(--ink-2)' }}>{x}</span>)}</div>
            </div>
          </div>
        </section>
        <section className="section">
          <SectionHead en="Our campus" title={`${user!.school} 학생들이 많이 빌린 가전`} />
          <div className="grid g4">{PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
        <Race counts={schoolCounts} mine={user!.school} />
      </>
    )

  return (
    <>
      <section className="wrap" style={{ background: 'var(--primary)', color: '#fff', paddingBlock: 'clamp(48px,7vw,80px)' }}>
        <div className="row between wrap-row gap-32" style={{ alignItems: 'flex-end' }}>
          <div className="stack gap-16">
            <span className="eyebrow" style={{ color: '#fff' }}>Seongbuk students only</span>
            <h1 className="serif" style={{ fontSize: 'clamp(40px,6vw,64px)' }}>학교 인증하면<br />첫 렌탈 첫 달 50%</h1>
            <p style={{ opacity: .9 }}>성신여대 · 고려대 · 국민대 · 한성대 · 동덕여대 · 서경대 · KC대</p>
          </div>
          <div className="stack" style={{ alignItems: 'flex-end' }}><span className="num" style={{ fontSize: 'clamp(120px,16vw,200px)' }}>50</span><b>% OFF · 첫 달</b></div>
        </div>
      </section>
      <section className="section">
        <SectionHead en="Benefits" title="인증하면 바로 받는 혜택" />
        <div className="grid g4" style={{ gap: 0, borderTop: '1px solid var(--ink)' }}>
          {[['01', '첫 달 50%', `첫 렌탈 1대 · 최대 ${won(10000)}`], ['02', '학교 목표 리워드', '100·200·300명마다 학교 전원 혜택'], ['03', '배송비 1회 무료', '1만원 → 0원'], ['04', '친구 초대 5,000원', '친구가 첫 렌탈을 받으면 둘 다']].map(([n, a, b], i) => (
            <div key={n} className="stack gap-8" style={{ padding: '24px 20px 24px ' + (i ? 20 : 0) + 'px', borderLeft: i ? '1px solid var(--line)' : 0 }}>
              <span className="serif" style={{ fontSize: 40, color: 'var(--primary)', fontWeight: 400 }}>{n}</span><b style={{ fontSize: 18 }}>{a}</b><span className="muted" style={{ fontSize: 14 }}>{b}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section bg-surface">
        <div className="split">
          <div className="stack gap-16">
            <span className="eyebrow">Student verification</span>
            <h2 className="serif" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>학교 메일로<br />1분이면 끝나요</h2>
            <p className="muted">학교 인증 회원은 종강·입대 시즌에 쓰던 가전을 팔면 매입가 +10%를 더 받아요.</p>
          </div>
          <div className="panel stack gap-12">
            <h3 className="serif" style={{ fontSize: 24 }}>학교 인증</h3>
            <div className="field"><label htmlFor="sc">학교</label><select id="sc" className="input" value={school} onChange={(e) => setSchool(e.target.value)}>{SCHOOLS.map((s) => <option key={s.name}>{s.name}</option>)}</select></div>
            <div className="field"><label htmlFor="em">학교 이메일</label>
              <div className="row gap-8"><div className="row input" style={{ padding: 0 }}><input id="em" className="input" style={{ border: 0 }} placeholder="아이디" value={id} onChange={(e) => setId(e.target.value)} /><span className="faint" style={{ paddingRight: 12, fontSize: 14 }}>@{dom}</span></div><button className="btn line" disabled={!id} onClick={() => setSent(true)}>{sent ? '다시 받기' : '코드 받기'}</button></div>
            </div>
            {sent && <div className="field"><label htmlFor="cd">인증 코드 (데모: 아무 6자리)</label><input id="cd" className="input" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></div>}
            <div className="field"><label htmlFor="iv">친구 초대 코드 (선택)</label><input id="iv" className="input" placeholder="예: SS-K7Q2" value={invite} onChange={(e) => setInvite(e.target.value)} /></div>
            <button className="btn block" disabled={code.length !== 6} onClick={() => { verifySchool(school, invite || undefined); if (!user) nav('/login?next=/school') }}>인증하고 혜택 받기</button>
            <span className="faint" style={{ fontSize: 12 }}>학교 메일이 없으면 학생증 사진으로 신청 → 운영자 확인</span>
          </div>
        </div>
      </section>
      <Race counts={schoolCounts} />
    </>
  )
}

function Race({ counts, mine }: { counts: Record<string, number>; mine?: string }) {
  return (
    <section className="section">
      <SectionHead en="Campus goal" title="우리 학교 인증이 모일수록 학교 전원이 혜택을 받아요" />
      <div className="stack"><hr className="rule ink" />
        {SCHOOLS.map((s) => {
          const n = counts[s.name] ?? s.count
          return (
            <div key={s.name}>
              <div className="row gap-16" style={{ paddingBlock: 14 }}>
                <b style={{ width: 90, color: s.name === mine ? 'var(--primary)' : undefined }}>{s.name}</b>
                <div style={{ flex: 1 }}><Bar pct={(n / GOAL) * 100} orange={s.name === mine} /></div>
                <span className="num" style={{ fontSize: 24, minWidth: 48, textAlign: 'right' }}>{n}</span><span className="faint" style={{ fontSize: 13 }}>/ {GOAL}</span>
              </div>
              <hr className="rule" />
            </div>
          )
        })}
      </div>
      <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>100명 전원 연장 쿠폰 3,000원 · 200명 대기 명단 우선 배정 · 300명 전원 프리미엄 케어 3개월 무료</p>
    </section>
  )
}
