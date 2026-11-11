// 메인 3D 미리보기 — 실물 스캔(GLB)을 바로 돌려 보고, 가로 · 깊이 · 높이 치수선을 함께 보여 줌. 자세히는 2-3a 3D 화면으로
// model-viewer가 커서 HomeRendy에서 따로 나눠 불러옴 (lazy)
// 치수선은 3D 보기 화면(Viewer3D)과 같은 방식: 앞면 모서리 3곳(왼위 · 오른위 · 왼아래)에 핫스팟을 두고 화면 위치를 이어 그림
import '@google/model-viewer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, lowest, won } from '../data'

const LIST = PRODUCTS.filter((p) => p.model3d)
type V3 = { x: number; y: number; z: number }
type MV = HTMLElement & { loaded: boolean; getDimensions: () => V3; getBoundingBoxCenter: () => V3 }
type Box = { c: V3; s: V3 }
const pos = (b: Box, at: number[]) => `${b.c.x + (at[0] * b.s.x) / 2}m ${b.c.y + (at[1] * b.s.y) / 2}m ${b.c.z + (at[2] * b.s.z) / 2}m`
const CORNERS: Record<'tl' | 'tr' | 'bl', number[]> = { tl: [-1, 1, 1], tr: [1, 1, 1], bl: [-1, -1, 1] }

export default function Home3D() {
  const [id, setId] = useState(LIST[0].id)
  const p = LIST.find((x) => x.id === id)!
  const m3 = p.model3d!
  const marks = m3.marks.standard
  const mv = useRef<MV>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [dims, setDims] = useState<{ w: number[]; h: number[] } | null>(null)

  // 모델 크기 읽기 → 모서리 핫스팟 위치
  useEffect(() => {
    const el = mv.current
    if (!el) return
    setBox(null); setDims(null)
    const onLoad = () => setBox({ c: el.getBoundingBoxCenter(), s: el.getDimensions() })
    el.addEventListener('load', onLoad)
    if (el.loaded) onLoad()
    return () => el.removeEventListener('load', onLoad)
  }, [id])

  // 치수선: 매 프레임 모서리 핫스팟의 화면 위치를 읽고, 바뀌었을 때만 다시 그림 (모델 위치가 늦게 잡혀도 따라감)
  const last = useRef('')
  const draw = useCallback(() => {
    const st = stage.current
    if (!st) return
    const r = st.getBoundingClientRect()
    const at = (n: string) => {
      const e = st.querySelector<HTMLElement>(`[slot="hotspot-dim-${n}"]`)
      if (!e) return null
      const b = e.getBoundingClientRect()
      return [Math.round(b.left + b.width / 2 - r.left), Math.round(b.top + b.height / 2 - r.top)]
    }
    const tl = at('tl'), tr = at('tr'), bl = at('bl')
    // 옆이나 뒤로 돌려 앞면 가로선이 짧아지면 숨김
    const ok = tl && tr && bl && Math.hypot(tr[0] - tl[0], tr[1] - tl[1]) >= 60 && Math.abs(bl[1] - tl[1]) >= 60
    const key = ok ? [tl, tr, bl].join() : ''
    if (key === last.current) return
    last.current = key
    setDims(ok ? { w: [tl[0], tl[1] - 22, tr[0], tr[1] - 22], h: [bl[0] - 28, tl[1], bl[0] - 28, bl[1]] } : null)
  }, [])
  useEffect(() => {
    if (!box) return
    let raf = 0
    const loop = () => { draw(); raf = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [box, draw])

  const sz = m3.size
  const ap = sz?.approx ? '약 ' : ''
  return (
    <div className="rd-3d">
      <div className="rd-3d-stage" style={{ background: p.bg }} ref={stage}>
        {/* 자동 회전은 끔: 치수선이 앞면에 붙어 있어 돌면 사라짐. 대신 손 모양 안내로 직접 돌려 보게 */}
        <model-viewer ref={(e: unknown) => { mv.current = e as MV | null }} key={p.id} src={m3.src.standard} alt={`${p.name} 3D 스캔`} camera-controls="" interaction-prompt="auto" shadow-intensity="1" exposure="1.05" camera-orbit="28deg 78deg 230%" touch-action="pan-y" style={{ width: '100%', height: '100%', background: 'transparent' }}>
          <div slot="progress-bar" />
          {box && (Object.keys(CORNERS) as (keyof typeof CORNERS)[]).map((k) => (
            <span key={k} slot={`hotspot-dim-${k}`} className="v3d-dimdot" data-position={pos(box, CORNERS[k])} />
          ))}
        </model-viewer>
        {sz && dims && (
          <>
            <svg className="v3d-dims" aria-hidden="true">
              <line x1={dims.w[0]} y1={dims.w[1]} x2={dims.w[2]} y2={dims.w[3]} />
              <line x1={dims.w[0]} y1={dims.w[1] - 6} x2={dims.w[0]} y2={dims.w[1] + 6} />
              <line x1={dims.w[2]} y1={dims.w[3] - 6} x2={dims.w[2]} y2={dims.w[3] + 6} />
              <line x1={dims.h[0]} y1={dims.h[1]} x2={dims.h[2]} y2={dims.h[3]} />
              <line x1={dims.h[0] - 6} y1={dims.h[1]} x2={dims.h[0] + 6} y2={dims.h[1]} />
              <line x1={dims.h[2] - 6} y1={dims.h[3]} x2={dims.h[2] + 6} y2={dims.h[3]} />
            </svg>
            <span className="v3d-dimtext" style={{ left: (dims.w[0] + dims.w[2]) / 2, top: Math.min(dims.w[1], dims.w[3]) - 24, transform: 'translateX(-50%)' }}>{ap}가로 {sz.w}cm · 깊이 {sz.d}cm</span>
            <span className="v3d-dimtext right" style={{ left: dims.h[0] - 8, top: (dims.h[1] + dims.h[3]) / 2, transform: 'translate(-100%,-50%)' }}>높이<br />{ap}{sz.h}cm</span>
          </>
        )}
        <span className="rd-3d-hint">끌어서 직접 돌려 보세요</span>
      </div>
      <div className="stack gap-12 rd-3d-side">
        <div className="chips">{LIST.map((x) => <button key={x.id} className={`chip ${id === x.id ? 'on' : ''}`} onClick={() => setId(x.id)}>{x.name}</button>)}</div>
        <b style={{ fontSize: 22 }}>{p.name} · 월 {won(lowest(p))}~</b>
        <span className="muted" style={{ fontSize: 14 }}>{m3.scanned} 실물 스캔{sz ? ` · ${ap}${sz.w}×${sz.d}×${sz.h}cm` : ''}</span>
        <div className="stack gap-4">
          <span className="faint" style={{ fontSize: 13 }}>이 기기에 원래 있던 흔적 {marks.length}곳 (반납 때 책임 없음)</span>
          {marks.map((m) => <span key={m.title} style={{ fontSize: 14 }}>· {m.title} <span className="faint">{m.note}</span></span>)}
        </div>
        <Link to={`/products/${p.id}/3d`} className="btn">흠집 위치까지 3D로 자세히 보기 ›</Link>
        <Link to={`/room?items=${p.id}`} className="btn line">내 방에 놓아 보기 ›</Link>
      </div>
    </div>
  )
}
