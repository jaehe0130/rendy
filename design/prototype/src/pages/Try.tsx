import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// 심사위원 체험: 실제 흠집 비교 모델(PatchCore, Modal)에 전/후 사진을 보내 새로 생긴 부분을 찾는다.
// 결과는 예비 — 렌디에서는 최종 판정을 운영자가 한다.
const VISION_URL = (import.meta.env.VITE_VISION_URL as string | undefined) || 'https://seongwon20--rendy-vision-web.us-east.modal.run'

interface Finding { bbox: number[]; lengthMm: number; confidence: number; suggestedClass: 'WEAR' | 'FAULT'; needsReview: boolean }
interface Res { aligned: boolean; findings: Finding[]; image: string | null; ms: number; wearThresholdMm: number }

// 올리기 전에 긴 변 768px JPEG로 줄임 (전송 빠르게)
function shrink(file: Blob): Promise<string> {
  return new Promise((ok, fail) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, 768 / Math.max(img.width, img.height))
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      ok(c.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = fail
    img.src = URL.createObjectURL(file)
  })
}

// 렌탈 한 번의 흐름(출고 → 사용 → 반납 → AI 판정)을 그대로 따라가는 체험. 예시 제습기 또는 내 물건으로
const USES = [
  { key: 'after-same', name: '조심히 썼어요', hint: '흠집 없이 사용' },
  { key: 'after-small', name: '살짝 긁혔어요', hint: '물통에 짧은 긁힘' },
  { key: 'after-scratch', name: '크게 긁혔어요', hint: '앞면에 긴 긁힘' },
  { key: 'after-tape', name: '테이프 자국', hint: '아래쪽에 남은 테이프' },
]
const STEPS = ['출고', '사용', '반납', 'AI 판정']

function PickPhoto({ label, onPick, primary }: { label: string; onPick: (f: File) => void; primary?: boolean }) {
  return (
    <label className={`btn ${primary ? '' : 'line'}`} style={{ position: 'relative', cursor: 'pointer' }}>
      {label}
      <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f) }} />
    </label>
  )
}

export default function Try() {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'sample' | 'mine'>('sample')
  const [use, setUse] = useState('')
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [slow, setSlow] = useState(false)
  const [res, setRes] = useState<Res | null>(null)
  const [err, setErr] = useState('')
  const topRef = useRef<HTMLDivElement>(null)

  // 들어오자마자 AI 서버를 깨워 둠 (무료 서버라 쉬고 있으면 처음 응답이 느림)
  useEffect(() => { fetch(`${VISION_URL}/healthz`).catch(() => {}) }, [])
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [step])

  const sample = async (n: string) => shrink(await (await fetch(`/samples/${n}.webp`)).blob())
  const startSample = async () => { setMode('sample'); setBefore(await sample('before')); setAfter(''); setUse(''); setStep(1) }
  const startMine = async (f: File) => { setMode('mine'); setBefore(await shrink(f)); setAfter(''); setUse(''); setStep(1) }

  const judge = async (b: string, a: string) => {
    setStep(3); setState('busy'); setSlow(false); setErr(''); setRes(null)
    const t = setTimeout(() => setSlow(true), 8000)
    try {
      const r = await fetch(`${VISION_URL}/v1/demo/compare`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ before: b, after: a, widthCm: 30 }) })
      if (!r.ok) throw new Error(`서버 응답 ${r.status}`)
      setRes(await r.json()); setState('done')
    } catch (e) {
      setErr(e instanceof Error ? e.message : '연결 실패'); setState('error')
    } finally { clearTimeout(t) }
  }
  const restart = () => { setStep(0); setUse(''); setBefore(''); setAfter(''); setRes(null); setState('idle') }

  const top = res?.findings[0]
  const wear = !top || top.suggestedClass === 'WEAR'
  return (
    <section className="section bg-surface try">
      <div ref={topRef} className="stack gap-8" style={{ marginBottom: 20, scrollMarginTop: 90 }}>
        <span className="eyebrow">AI 반납 판정 체험</span>
        <h1 className="serif" style={{ fontSize: 'clamp(28px,6vw,44px)' }}>빌리고, 쓰고, 반납해 보세요</h1>
        <p className="muted">렌디는 출고 사진과 반납 사진을 AI가 비교해 새로 생긴 흠집만 찾아요.</p>
      </div>

      <ol className="try-steps">{STEPS.map((s, i) => <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}><b>{i + 1}</b>{s}</li>)}</ol>

      <div className="panel stack gap-16 try-card">
        {step === 0 && (
          <>
            <b className="try-title">렌디는 보내기 전에 기기를 찍어 둬요</b>
            <span className="muted">이 <b>출고 사진</b>이 반납 때 비교 기준이 돼요. 어떤 기기로 해 볼까요?</span>
            <div className="try-start">
              <button className="try-choice" onClick={startSample}>
                <img src="/samples/before.webp" alt="예시 제습기 출고 사진" />
                <b>예시 제습기</b><span>준비된 사진으로 바로</span>
              </button>
              <label className="try-choice">
                <div className="try-cam">📷</div>
                <b>내 물건 찍기</b><span>텀블러 · 책 등 아무 물건</span>
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) startMine(f) }} />
              </label>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <b className="try-title">2개월 동안 쓰는 중…</b>
            <div className="try-pair one"><figure><img src={before} alt="출고 사진" /><figcaption>출고 사진</figcaption></figure></div>
            {mode === 'sample' ? (
              <>
                <span className="muted">쓰는 동안 어떤 일이 있었나요?</span>
                <div className="try-uses">{USES.map((u) => <button key={u.key} className={`try-use ${use === u.key ? 'on' : ''}`} onClick={() => setUse(u.key)}><b>{u.name}</b><span>{u.hint}</span></button>)}</div>
                <button className="btn block" disabled={!use} onClick={() => setStep(2)}>다 썼어요 · 반납하기</button>
              </>
            ) : (
              <>
                <span className="muted">물건에 <b>테이프나 스티커를 붙여</b> 사용 흔적을 만들어 보세요. (그대로 둬도 돼요)</span>
                <button className="btn block" onClick={() => setStep(2)}>다 썼어요 · 반납하기</button>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <b className="try-title">반납할 때 같은 자리에서 찍어요</b>
            <span className="muted">출고 사진과 같은 거리 · 같은 각도로 찍으면 잘 비교돼요.</span>
            <div className="try-pair">
              <figure><img src={before} alt="출고 사진" /><figcaption>출고 사진</figcaption></figure>
              <figure>{after ? <img src={after} alt="반납 사진" /> : <div className="try-empty">반납 사진</div>}<figcaption>반납 사진</figcaption></figure>
            </div>
            {mode === 'sample' ? (
              after ? <button className="btn block" onClick={() => judge(before, after)}>AI 판정 받기</button>
                : <button className="btn block" onClick={async () => setAfter(await sample(use))}>반납 사진 찍기</button>
            ) : after ? (
              <div className="row gap-8"><PickPhoto label="다시 찍기" onPick={async (f) => setAfter(await shrink(f))} /><button className="btn" style={{ flex: 1 }} onClick={() => judge(before, after)}>AI 판정 받기</button></div>
            ) : <PickPhoto primary label="반납 사진 찍기" onPick={async (f) => setAfter(await shrink(f))} />}
          </>
        )}

        {step === 3 && (
          <>
            <b className="try-title">AI 예비 판정</b>
            {state === 'busy' && <span className="muted">{slow ? 'AI 서버 깨우는 중… 최대 1분' : '출고 사진과 반납 사진을 비교하는 중…'}</span>}
            {state === 'error' && <span className="muted">AI 서버에 연결하지 못했어요 ({err}). <button className="btn line sm" onClick={() => judge(before, after)}>다시 시도</button></span>}
            {state === 'done' && res && (
              <>
                <div className="try-pair">
                  <figure><img src={before} alt="출고 사진" /><figcaption>출고 사진</figcaption></figure>
                  <figure>{res.image && top ? <img src={res.image} alt="AI가 찾은 부분" /> : <img src={after} alt="반납 사진" />}<figcaption>{top ? '반납 · AI 표시' : '반납 사진'}</figcaption></figure>
                </div>
                <div className="row gap-8"><span className="badge solid">AI 예비 판정</span>{top && (top.needsReview || !res.aligned) && <span className="badge orange">운영자 확인 필요</span>}</div>
                <b style={{ fontSize: 22 }}>{top ? `새로 생긴 흠집 ${res.findings.length}곳 · 약 ${(top.lengthMm / 10).toFixed(1)}cm` : '새로 생긴 흠집이 없어요'}</b>
                <div className="kv" style={{ fontSize: 16 }}><span>예상 분류</span><b>{wear ? '생활 마모' : '과실 파손 후보'}</b></div>
                <div className="kv" style={{ fontSize: 16 }}><span>예상 고객 부담</span><b style={{ color: 'var(--primary)' }}>{wear ? '0원' : '보장 단계에 따라'}</b></div>
                <span className="faint" style={{ fontSize: 12 }}>2cm 이하는 생활 마모라 0원이에요. AI는 후보만 표시하고, 회수 후 운영자가 최종 판정해요.{res.aligned ? '' : ' 두 사진 각도가 많이 달라 맞추지 못했어요.'}</span>
                <div className="row gap-8 wrap-row">
                  <Link to="/admin/judge?demo" className="btn">운영자 최종 판정 보기</Link>
                  <button className="btn line" onClick={restart}>처음부터 다시</button>
                </div>
              </>
            )}
          </>
        )}

        {step > 0 && step < 3 && <button className="try-back" onClick={() => setStep(step - 1)}>← 이전</button>}
      </div>
    </section>
  )
}
