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

function Shot({ n, label, url, onPick }: { n: string; label: string; url: string; onPick: (f: File) => void }) {
  return (
    <label className="try-shot">
      {url ? <img src={url} alt={label} /> : <span><b>{n}</b>{label}<small className="faint">찍기 · 앨범에서 고르기</small></span>}
      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f) }} />
    </label>
  )
}

// 미리 준비한 제습기 앞면 전/후 사진 (실제 모델로 확인한 예시)
const SAMPLES = [
  { key: 'after-scratch', name: '긁힘', hint: '앞면 가운데 긴 긁힘' },
  { key: 'after-tape', name: '테이프', hint: '아래쪽에 붙인 테이프' },
  { key: 'after-small', name: '작은 긁힘', hint: '물통에 짧은 긁힘' },
  { key: 'after-same', name: '변화 없음', hint: '같은 상태로 다시 찍음' },
]

export default function Try() {
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const [picked, setPicked] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [slow, setSlow] = useState(false)
  const [res, setRes] = useState<Res | null>(null)
  const [err, setErr] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  // 들어오자마자 AI 서버를 깨워 둠 (무료 서버라 쉬고 있으면 처음 응답이 느림)
  useEffect(() => { fetch(`${VISION_URL}/healthz`).catch(() => {}) }, [])

  const run = async (b: string, a: string) => {
    setState('busy'); setSlow(false); setErr(''); setRes(null)
    if (window.innerWidth < 860) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const t = setTimeout(() => setSlow(true), 8000)
    try {
      const r = await fetch(`${VISION_URL}/v1/demo/compare`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ before: b, after: a, widthCm: 30 }) })
      if (!r.ok) throw new Error(`서버 응답 ${r.status}`)
      setRes(await r.json()); setState('done')
    } catch (e) {
      setErr(e instanceof Error ? e.message : '연결 실패'); setState('error')
    } finally { clearTimeout(t) }
  }

  // 예시 카드를 누르면 사진을 불러와 바로 비교
  const pickSample = async (key: string) => {
    if (state === 'busy') return
    setPicked(key)
    const get = async (n: string) => shrink(await (await fetch(`/samples/${n}.webp`)).blob())
    const [b, a] = await Promise.all([get('before'), get(key)])
    run(b, a)
  }

  const top = res?.findings[0]
  return (
    <section className="section bg-surface try">
      <div className="stack gap-8" style={{ marginBottom: 20 }}>
        <span className="eyebrow">AI 체험</span>
        <h1 className="serif" style={{ fontSize: 'clamp(28px,6vw,44px)' }}>AI 흠집 찾기, 바로 해 보세요</h1>
        <p className="muted">제습기 사진을 하나 고르면, AI가 출고 사진과 비교해 새로 생긴 흠집을 찾아요.</p>
      </div>

      <div className="try-grid">
        <div className="stack gap-16">
          <div className="panel stack gap-12">
            <div className="row between"><b>예시 사진 고르기</b><span className="faint" style={{ fontSize: 12 }}>누르면 바로 비교해요</span></div>
            <div className="try-samples">
              {SAMPLES.map((x) => (
                <button key={x.key} className={`try-sample ${picked === x.key ? 'on' : ''}`} disabled={state === 'busy'} onClick={() => pickSample(x.key)}>
                  <div className="pair"><img src="/samples/before.webp" alt="출고 사진" /><span>→</span><img src={`/samples/${x.key}.webp`} alt={`반납 사진 · ${x.name}`} /></div>
                  <div className="row between"><b>{x.name}</b><span className="go">{picked === x.key && state === 'busy' ? '비교 중…' : '비교하기 →'}</span></div>
                  <span className="h">{x.hint}</span>
                </button>
              ))}
            </div>
            <span className="faint" style={{ fontSize: 12 }}>왼쪽 = 출고 사진 · 오른쪽 = 반납 사진</span>
          </div>

          <details className="panel try-mine">
            <summary>내 사진으로 해 보기</summary>
            <div className="stack gap-12" style={{ marginTop: 12 }}>
              <span className="faint" style={{ fontSize: 12 }}>물건을 찍고, 테이프를 붙여 같은 자리에서 다시 찍어요.</span>
              <div className="try-shots">
                <Shot n="1" label="전 사진" url={before} onPick={async (f) => { setBefore(await shrink(f)); setPicked('mine') }} />
                <Shot n="2" label="테이프 붙이고 다시" url={after} onPick={async (f) => { setAfter(await shrink(f)); setPicked('mine') }} />
              </div>
              <button className="btn block" disabled={!before || !after || state === 'busy'} onClick={() => run(before, after)}>{state === 'busy' && picked === 'mine' ? 'AI가 비교하는 중…' : 'AI로 비교하기'}</button>
            </div>
          </details>
        </div>

        <div ref={resultRef} className="panel stack gap-12" style={{ scrollMarginTop: 90 }}>
          {state === 'done' && res ? (
            <>
              {res.image && <img src={res.image} alt="AI가 찾은 부분" style={{ width: '100%', borderRadius: 4 }} />}
              {top ? (
                <>
                  <div className="row gap-8"><span className="badge solid">AI 예비 판정</span>{(top.needsReview || !res.aligned) && <span className="badge orange">운영자 확인 필요</span>}</div>
                  <b style={{ fontSize: 22 }}>새로 생긴 부분 {res.findings.length}곳 · 가장 긴 것 약 {(top.lengthMm / 10).toFixed(1)}cm</b>
                  <span className="muted">{top.suggestedClass === 'WEAR' ? '2cm 이하 → 생활 마모 후보 (고객 부담 0원)' : '2cm 넘음 → 과실 파손 후보'}</span>
                </>
              ) : <b style={{ fontSize: 20 }}>새로 생긴 부분이 없어요</b>}
              <span className="faint" style={{ fontSize: 12 }}>{res.aligned ? '' : '두 사진 각도가 많이 달라 맞추지 못했어요. · '}길이는 추정값 · {(res.ms / 1000).toFixed(1)}초</span>
            </>
          ) : state === 'busy' ? (
            <b style={{ fontSize: 18 }}>{slow ? 'AI 서버 깨우는 중… 최대 1분' : 'AI가 사진을 비교하는 중…'}</b>
          ) : state === 'error' ? (
            <span className="muted">AI 서버에 연결하지 못했어요 ({err}). 잠시 뒤 다시 눌러 주세요.</span>
          ) : (
            <span className="faint">예시 사진을 고르면 결과가 여기에 나와요.</span>
          )}
          <hr className="rule" />
          <span className="faint" style={{ fontSize: 12 }}>AI는 후보만 표시하고, 최종 판정은 운영자가 해요.</span>
          <Link to="/admin/judge?demo" className="btn line sm" style={{ alignSelf: 'flex-start' }}>운영자 판정 화면 보기</Link>
        </div>
      </div>
    </section>
  )
}
