import { useEffect, useRef, useState, type ReactNode } from 'react'
import { planOf, type PlanKey } from './data'

// 반납 AI 예비 판정: 렌디가 출고 때 찍은 사진(고정) ↔ 사용자가 반납할 때 찍은 사진을 실제 흠집 모델(Modal)로 비교.
// 결과는 예비 — 최종 판정은 회수 후 운영자. 체험 화면(/try)과 내 렌탈 반납 팝업에서 같이 씀
export const VISION_URL = (import.meta.env.VITE_VISION_URL as string | undefined) || 'https://gamma0225--rendy-vision-web.us-east.modal.run'
// 시연용 상품별 예시: 출고 사진(렌디가 보내기 전에 찍어 둔 앞면) ↔ 같은 기기의 반납 사진(긁힘) 짝. 키 = 상품 id (data.ts)
// 출고 사진 = 상품 사진(원본)을 기기 부분만 자른 것. 긁힘 A ↔ 상품 사진 1, B ↔ 2, C ↔ 3
// 예시 반납 사진 A를 누르면 출고 사진도 A의 짝으로 바뀜. 실제 모델이 흠집을 찾는 짝만 넣음 (2026-11-06 확인)
interface Pair { key: string; name: string; before: string }
interface Kit { name: string; pairs: Pair[] }
const pairs = (id: string, list: [number, number][]): Pair[] =>
  list.map(([o, s], i) => ({ key: `${id}-s${s}`, name: `긁힘 ${'ABC'[i]}`, before: `/samples/${id}-o${o}.webp` }))
export const KITS: Record<string, Kit> = {
  'dehumidifier-10': { name: '제습기 10L', pairs: pairs('dehumidifier-10', [[1, 1], [2, 2], [3, 3]]) },
  'dehumidifier-16': { name: '제습기 16L', pairs: pairs('dehumidifier-16', [[3, 1], [2, 3]]) },
  humidifier: { name: '가습기', pairs: pairs('humidifier', [[3, 3]]) },
  'mini-dryer': { name: '미니 건조기', pairs: pairs('mini-dryer', [[1, 1], [3, 3]]) },
  foodwaste: { name: '음식물 처리기', pairs: pairs('foodwaste', [[2, 2], [3, 3]]) },
}
// 예시가 없는 상품: 출고 사진 자리에 상품 사진, 예시 줄은 숨김
const kitOf = (id: string): Kit => KITS[id] ?? { name: '', pairs: [] }
const firstBefore = (id: string) => kitOf(id).pairs[0]?.before ?? `/products/${id}-1.webp`

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

// kits: 상품 id 목록 (체험 화면은 고를 수 있게 여러 개, 내 렌탈 반납은 빌린 상품 하나)
// 예시 반납 사진 줄: 심사위원은 반납할 실물이 없으니 체험 화면 · 반납 팝업 둘 다 그 상품 사진을 보여 줌
// lockOutbound: 내 렌탈 반납 — 빌린 그 기기(상품 사진 1 = 긁힘 A의 원본)의 출고 사진으로 고정. 다른 예시를 골라도 안 바뀜
export function ReturnCompare({ plan, actions, kits = ['dehumidifier-10'], lockOutbound = false }: { plan?: PlanKey; actions?: (r: VisionRes, wear: boolean) => ReactNode; kits?: string[]; lockOutbound?: boolean }) {
  const [kit, setKit] = useState(kits[0])
  const [outbound, setOutbound] = useState(firstBefore(kits[0]))
  const samples = kitOf(kit).pairs
  const [after, setAfter] = useState('')
  const [pick, setPick] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [slow, setSlow] = useState(false)
  const [res, setRes] = useState<VisionRes | null>(null)
  const [err, setErr] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  // 들어오자마자 AI 서버를 깨워 둠 (쉬고 있으면 처음 응답이 느림)
  useEffect(() => { fetch(`${VISION_URL}/healthz`).catch(() => {}) }, [])
  // ?sample=dehumidifier-10-s2 이면 그 예시 반납 사진으로 바로 비교 (시안 캡처 · 시연용)
  useEffect(() => {
    const k = new URLSearchParams(location.search).get('sample')
    const kk = kits.find((x) => kitOf(x).pairs.some((p) => p.key === k))
    const p = kk && kitOf(kk).pairs.find((x) => x.key === k)
    if (!kk || !p) return
    const before = lockOutbound ? firstBefore(kk) : p.before
    setKit(kk); setOutbound(before)
    ;(async () => { const a = await shrink(await (await fetch(`/samples/${p.key}.webp`)).blob()); setAfter(a); setPick(p.key); run(a, before) })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setA = (v: string, key = '') => { setAfter(v); setPick(key); setRes(null); setState('idle') }
  const pickKit = (k: string) => { setKit(k); setOutbound(firstBefore(k)); setA('') }
  // 체험 화면: 예시 반납 사진을 고르면 출고 사진도 그 기기의 출고 사진으로 (내 렌탈 반납은 고정)
  const pickSample = async (p: Pair) => { if (!lockOutbound) setOutbound(p.before); setA(await shrink(await (await fetch(`/samples/${p.key}.webp`)).blob()), p.key) }
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
        <div className="chips">{kits.map((k) => <button key={k} className={`chip ${kit === k ? 'on' : ''}`} onClick={() => pickKit(k)}>{kitOf(k).name}</button>)}</div>
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

      {samples.length > 0 && <div className="rc-samples">
        <span>비교할 가전이 없으시면 이 사진을 사용해 주세요</span>
        <div className="row gap-8 wrap-row">
          {samples.map((x) => (
            <button key={x.key} className={`try-thumb ${pick === x.key ? 'on' : ''}`} onClick={() => pickSample(x)}>
              <img src={`/samples/${x.key}.webp`} alt={`예시 반납 사진 · ${x.name}`} /><span>{x.name}</span>
            </button>
          ))}
        </div>
      </div>}

      {state !== 'done' && (
        <button className="btn block" disabled={!after || state === 'busy'} onClick={() => run()}>{state === 'busy' ? (slow ? 'AI 서버 깨우는 중… 최대 1분' : 'AI가 출고 사진과 비교하는 중…') : 'AI로 출고 사진과 비교하기'}</button>
      )}
      {state === 'error' && <span className="muted" style={{ fontSize: 13 }}>AI 서버에 연결하지 못했어요 ({err}). 잠시 뒤 다시 눌러 주세요.</span>}

      {state === 'done' && res && (
        <div ref={resultRef} className="stack gap-12">
          {bad ? (
            <div className="try-check stack gap-8">
              <b style={{ fontSize: 18 }}>사진을 확인해 주세요</b>
              <span className="muted" style={{ fontSize: 14 }}>빌린 가전을 출고 사진과 같은 거리 · 같은 각도에서 밝게 찍었는지 확인해 주세요.</span>
              <button className="btn line sm" style={{ alignSelf: 'flex-start' }} onClick={() => setA('')}>다시 찍기</button>
            </div>
          ) : (
            <>
              {top && res.image && <img src={res.image} alt="AI가 찾은 부분" style={{ width: '100%', borderRadius: 4 }} />}
              <div className="row gap-8"><span className="badge solid">AI 예비 판정</span>{top?.needsReview && <span className="badge orange">운영자 확인 필요</span>}</div>
              <b style={{ fontSize: 20 }}>{top ? `새로 생긴 흠집 ${res.findings.length}곳 · 약 ${(top.lengthMm / 10).toFixed(1)}cm` : '새로 생긴 흠집이 없어요'}</b>
              <div className="kv"><span>예상 분류</span><b>{wear ? '생활 마모' : '과실 파손 후보'}</b></div>
              <div className="kv"><span>예상 부담</span><b style={{ color: 'var(--primary)' }}>{wear ? '0원' : plan ? `수리비의 ${share}% (${plan === 'basic' ? '파손 케어 없음' : `${planOf(plan).name} 케어`})` : '파손 케어에 따라'}</b></div>
              <span className="faint" style={{ fontSize: 12 }}>2cm 이하는 생활 마모라 0원 · AI는 후보만 표시하고, 회수 후 운영자가 최종 판정해요 · {(res.ms / 1000).toFixed(1)}초</span>
              {actions?.(res, wear)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
