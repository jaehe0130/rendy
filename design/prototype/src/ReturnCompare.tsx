import { useEffect, useRef, useState, type ReactNode } from 'react'
import { planOf, type PlanKey } from './data'

// 반납 AI 예비 판정: 렌디가 출고 때 찍은 사진(고정) ↔ 사용자가 반납할 때 찍은 사진을 실제 흠집 모델(Modal)로 비교.
// 결과는 예비 — 최종 판정은 회수 후 운영자. 체험 화면(/try)과 내 렌탈 반납 팝업에서 같이 씀
export const VISION_URL = (import.meta.env.VITE_VISION_URL as string | undefined) || 'https://seongwon20--rendy-vision-web.us-east.modal.run'
// 시연용 가전별 출고 사진(렌디가 보내기 전에 찍어 둔 앞면)과 예시 반납 사진
export const KITS = {
  hum: { name: '가습기', before: '/samples/hum-before.webp', afters: [{ key: 'hum-after-scratch', name: '긁힘' }] },
  dehum: { name: '제습기', before: '/samples/before.webp', afters: [
    { key: 'after-scratch', name: '긁힘' },
    { key: 'after-tape', name: '테이프' },
    { key: 'after-small', name: '작은 긁힘' },
    { key: 'after-same', name: '변화 없음' },
  ] },
}
export type KitKey = keyof typeof KITS
const kitOfSample = (k: string) => (Object.keys(KITS) as KitKey[]).find((x) => KITS[x].afters.some((a) => a.key === k))

interface Finding { bbox: number[]; lengthMm: number; confidence: number; suggestedClass: 'WEAR' | 'FAULT'; needsReview: boolean }
export interface VisionRes { aligned: boolean; mismatch?: boolean; findings: Finding[]; image: string | null; ms: number }

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

// kits: 고를 수 있는 가전 (체험 화면은 둘 다, 내 렌탈 반납은 빌린 가전 하나)
export function ReturnCompare({ plan, actions, kits = ['dehum'] }: { plan?: PlanKey; actions?: (r: VisionRes, wear: boolean) => ReactNode; kits?: KitKey[] }) {
  const [kit, setKit] = useState<KitKey>(kits[0])
  const outbound = KITS[kit].before
  const [after, setAfter] = useState('')
  const [pick, setPick] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [slow, setSlow] = useState(false)
  const [res, setRes] = useState<VisionRes | null>(null)
  const [err, setErr] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  // 들어오자마자 AI 서버를 깨워 둠 (쉬고 있으면 처음 응답이 느림)
  useEffect(() => { fetch(`${VISION_URL}/healthz`).catch(() => {}) }, [])
  // ?sample=after-tape 이면 그 예시 반납 사진으로 바로 비교 (시안 캡처 · 시연용)
  useEffect(() => {
    const k = new URLSearchParams(location.search).get('sample')
    const kk = k ? kitOfSample(k) : undefined
    if (!k || !kk) return
    setKit(kk)
    ;(async () => { const a = await shrink(await (await fetch(`/samples/${k}.webp`)).blob()); setAfter(a); setPick(k); run(a, KITS[kk].before) })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setA = (v: string, key = '') => { setAfter(v); setPick(key); setRes(null); setState('idle') }
  const pickKit = (k: KitKey) => { setKit(k); setA('') }
  const run = async (a = after, before0 = outbound) => {
    setState('busy'); setSlow(false); setErr(''); setRes(null)
    const t = setTimeout(() => setSlow(true), 8000)
    try {
      const before = await shrink(await (await fetch(before0)).blob())
      const r = await fetch(`${VISION_URL}/v1/demo/compare`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ before, after: a, widthCm: 30 }) })
      if (!r.ok) throw new Error(`서버 응답 ${r.status}`)
      setRes(await r.json()); setState('done')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '연결 실패'); setState('error')
    } finally { clearTimeout(t) }
  }

  const top = res?.findings[0]
  const bad = !!res && (res.mismatch || !res.aligned || (!!top && top.lengthMm > 150))
  const wear = !top || top.suggestedClass === 'WEAR'
  const share = planOf(plan).repairShare
  return (
    <div className="stack gap-12 rc">
      {kits.length > 1 && (
        <div className="chips">{kits.map((k) => <button key={k} className={`chip ${kit === k ? 'on' : ''}`} onClick={() => pickKit(k)}>{KITS[k].name}</button>)}</div>
      )}
      <div className="rc-pair">
        <figure>
          <img src={outbound} alt="출고 사진" />
          <figcaption><b>출고 사진</b><span>렌디가 보내기 전에 찍어 둔 사진</span></figcaption>
        </figure>
        <figure>
          <label className="rc-slot">
            {after ? <img src={after} alt="반납 사진" /> : <span><b>+</b>반납 사진 찍기<small>찍기 · 앨범에서 고르기</small></span>}
            <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setA(await shrink(f)) }} />
          </label>
          <figcaption><b>반납 사진</b><span>출고 사진과 같은 각도로</span></figcaption>
        </figure>
      </div>

      <div className="rc-samples">
        <span>비교할 가전이 없으시면 이 사진을 사용해 주세요</span>
        <div className="row gap-8 wrap-row">
          {KITS[kit].afters.map((x) => (
            <button key={x.key} className={`try-thumb ${pick === x.key ? 'on' : ''}`} onClick={async () => setA(await shrink(await (await fetch(`/samples/${x.key}.webp`)).blob()), x.key)}>
              <img src={`/samples/${x.key}.webp`} alt={`예시 반납 사진 · ${x.name}`} /><span>{x.name}</span>
            </button>
          ))}
        </div>
      </div>

      {state !== 'done' && (
        <button className="btn block" disabled={!after || state === 'busy'} onClick={() => run()}>{state === 'busy' ? (slow ? 'AI 서버 깨우는 중… 최대 1분' : 'AI가 출고 사진과 비교하는 중…') : 'AI로 출고 사진과 비교하기'}</button>
      )}
      {state === 'error' && <span className="muted" style={{ fontSize: 13 }}>AI 서버에 연결하지 못했어요 ({err}). 잠시 뒤 다시 눌러 주세요.</span>}

      {state === 'done' && res && (
        <div ref={resultRef} className="stack gap-12">
          {bad ? (
            <div className="try-check stack gap-8">
              <b style={{ fontSize: 18 }}>사진을 확인해 주세요</b>
              <span className="muted" style={{ fontSize: 14 }}>빌린 가전을 출고 사진과 같은 거리 · 같은 각도에서 밝게 찍었는지 확인해 주세요. 계속 안 되면 고객센터로 문의해 주세요.</span>
              <b style={{ fontSize: 14 }}>고객센터 1600-0000 · 평일 10~18시</b>
              <button className="btn line sm" style={{ alignSelf: 'flex-start' }} onClick={() => setA('')}>다시 찍기</button>
            </div>
          ) : (
            <>
              {top && res.image && <img src={res.image} alt="AI가 찾은 부분" style={{ width: '100%', borderRadius: 4 }} />}
              <div className="row gap-8"><span className="badge solid">AI 예비 판정</span>{top?.needsReview && <span className="badge orange">운영자 확인 필요</span>}</div>
              <b style={{ fontSize: 20 }}>{top ? `새로 생긴 흠집 ${res.findings.length}곳 · 약 ${(top.lengthMm / 10).toFixed(1)}cm` : '새로 생긴 흠집이 없어요'}</b>
              <div className="kv"><span>예상 분류</span><b>{wear ? '생활 마모' : '과실 파손 후보'}</b></div>
              <div className="kv"><span>예상 부담</span><b style={{ color: 'var(--primary)' }}>{wear ? '0원' : plan ? `수리비의 ${share}% (${planOf(plan).name} 보장)` : '보장 단계에 따라'}</b></div>
              <span className="faint" style={{ fontSize: 12 }}>2cm 이하는 생활 마모라 0원 · AI는 후보만 표시하고, 회수 후 운영자가 최종 판정해요 · {(res.ms / 1000).toFixed(1)}초</span>
              {actions?.(res, wear)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
