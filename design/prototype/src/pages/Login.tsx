import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'

// 가입한 휴대폰 번호 목록 (프로토타입: 이 브라우저에만 저장). 가입한 번호로 인증하면 약관 없이 바로 로그인 (기능명세서 AUTH-06)
const KNOWN = 'rendy-known-phones'
const knownPhones = (): string[] => { try { return JSON.parse(localStorage.getItem(KNOWN) || '[]') } catch { return [] } }
const remember = (phone: string) => { try { localStorage.setItem(KNOWN, JSON.stringify([...new Set([...knownPhones(), phone])])) } catch { /* 저장소를 못 쓰면 무시 */ } }

export default function Login() {
  const [sp] = useSearchParams()
  const next = sp.get('next') || '/'
  const nav = useNavigate()
  const { login } = useStore()
  // ?step=2 인증번호 단계, ?returning 다시 온 회원 (시안 캡처·시연용)
  const [step, setStep] = useState<1 | 2>(sp.get('step') === '2' ? 2 : 1)
  const [name, setName] = useState('김성북')
  const [phone, setPhone] = useState('010-1234-5678')
  const [code, setCode] = useState('')
  const [agree, setAgree] = useState(true)
  const returning = sp.has('returning') || knownPhones().includes(phone)
  const finish = () => { remember(phone); login(name, phone); nav(next) }

  return (
    <section className="section bg-surface">
      <div className="grid g2" style={{ alignItems: 'center', gap: 48 }}>
        <div className="stack gap-16">
          <span className="eyebrow">Login · Sign up</span>
          <h1 className="serif" style={{ fontSize: 'clamp(32px,5vw,52px)' }}>휴대폰 번호 하나로<br />로그인 · 회원가입</h1>
          <p className="muted">비밀번호 없이 휴대폰 인증으로 시작해요. 처음이면 가입, 가입한 번호면 바로 로그인돼요.<br />보증금 없이 빌려드리기 위해 본인 확인이 필요해요.</p>
        </div>
        <div className="panel stack gap-16">
          {step === 1 ? (
            <>
              <h2 className="serif" style={{ fontSize: 26 }}>로그인 · 회원가입</h2>
              <div className="field"><label htmlFor="nm">이름</label><input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label>통신사</label><div className="chips">{['SKT', 'KT', 'LG U+', '알뜰폰'].map((x, i) => <span key={x} className={`chip ${i === 0 ? 'on' : ''}`}>{x}</span>)}</div></div>
              <div className="field"><label htmlFor="ph">휴대폰 번호</label><input id="ph" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <button className="btn block" disabled={!name || phone.length < 10} onClick={() => setStep(2)}>인증번호 받기</button>
              <span className="faint" style={{ fontSize: 12 }}>가입한 번호면 인증 후 바로 로그인되고, 처음이면 약관 동의 후 가입돼요.</span>
            </>
          ) : (
            <>
              <h2 className="serif" style={{ fontSize: 26 }}>{returning ? `다시 오셨네요, ${name}님` : '인증번호 입력'}</h2>
              <p className="muted" style={{ fontSize: 14 }}>{phone}로 보낸 6자리를 입력하세요. <b>(데모: 아무 6자리)</b></p>
              <input className="input" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} style={{ fontSize: 22, letterSpacing: '.4em', textAlign: 'center' }} aria-label="인증번호" />
              {returning ? (
                <span className="faint" style={{ fontSize: 13 }}>가입한 번호예요. 약관은 가입할 때 동의하셨어요.</span>
              ) : (
                <label className="row gap-8" style={{ fontSize: 14 }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 이용약관 · 개인정보 수집 · 파손 안내에 동의 (필수)</label>
              )}
              <button className="btn block" disabled={code.length !== 6 || (!returning && !agree)} onClick={finish}>{returning ? '로그인' : '동의하고 가입하기'}</button>
              <button className="btn line block" onClick={() => setStep(1)}>번호 다시 입력</button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
