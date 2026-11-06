// 2-3a 3D로 보기 — 실물 스캔(GLB)을 돌려보며 크기와 기존 흠집 위치를 확인
// 3D는 @google/model-viewer. 흠집 핀·치수선은 모델 크기 기준 비율(data.ts ScanMark.at)로 붙인다.
import '@google/model-viewer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CATEGORIES, priceOf, productById, won, type ScanMark, type ViewKey } from '../data'
import { Modal, ProductArt, Toast } from '../components'
import { useStore, type Grade } from '../store'
import '../viewer3d.css'

/* model-viewer 를 JSX 에서 쓰기 위한 타입 */
type MV = HTMLElement & {
  loaded: boolean
  canActivateAR: boolean
  cameraOrbit: string
  fieldOfView: string
  getCameraOrbit: () => { theta: number; phi: number; radius: number }
  getDimensions: () => { x: number; y: number; z: number }
  getBoundingBoxCenter: () => { x: number; y: number; z: number }
  activateAR: () => Promise<void>
  jumpCameraToGoal: () => void
  resetTurntableRotation: (theta?: number) => void
}
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': { ref?: React.Ref<MV>; children?: ReactNode; style?: CSSProperties; class?: string; [attr: string]: unknown }
    }
  }
}

const VIEWS: { key: ViewKey; label: string; orbit: string }[] = [
  { key: 'front', label: '정면', orbit: '0deg 78deg' },
  { key: 'side', label: '옆면', orbit: '90deg 78deg' },
  { key: 'back', label: '뒷면', orbit: '180deg 78deg' },
  { key: 'top', label: '위에서', orbit: '0deg 12deg' },
]
// 좁은 화면에선 조금 멀리서 (도구 막대와 겹치지 않게)
const orbitOf = (k: ViewKey) => `${VIEWS.find((v) => v.key === k)!.orbit} ${window.innerWidth < 960 ? '185%' : '150%'}`
const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']

type Box = { c: { x: number; y: number; z: number }; s: { x: number; y: number; z: number } }
const pos = (b: Box, at: [number, number, number]) =>
  `${b.c.x + (at[0] * b.s.x) / 2}m ${b.c.y + (at[1] * b.s.y) / 2}m ${b.c.z + (at[2] * b.s.z) / 2}m`
/** 핀이 붙은 면의 바깥 방향 (뒤로 돌아가면 흐리게) */
const normalOf = (at: [number, number, number]) => {
  const i = [0, 1, 2].reduce((m, k) => (Math.abs(at[k]) > Math.abs(at[m]) ? k : m), 0)
  const n = [0, 0, 0]
  n[i] = Math.sign(at[i]) || 1
  return `${n[0]}m ${n[1]}m ${n[2]}m`
}

export default function Viewer3D() {
  const { id } = useParams()
  const p = productById(id ?? '')
  const nav = useNavigate()
  const { addToCart } = useStore()
  const mv = useRef<MV>(null)
  const stage = useRef<HTMLDivElement>(null)

  const hasValue = !!(p?.monthly.value != null && p?.model3d?.src.value)
  const [grade, setGrade] = useState<Grade>('standard')
  const [view, setView] = useState<ViewKey>('front')
  const [auto, setAuto] = useState(true)
  const [pins, setPins] = useState(true)
  const [sel, setSel] = useState<number | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [dims, setDims] = useState<{ w: [number, number, number, number]; h: [number, number, number, number] } | null>(null)
  const [photo, setPhoto] = useState(false)
  const [toast, setToast] = useState('')
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const m3 = p?.model3d
  const src = m3 ? (grade === 'value' && m3.src.value ? m3.src.value : m3.src.standard) : ''
  const marks: ScanMark[] = m3 ? (grade === 'value' ? m3.marks.value ?? [] : m3.marks.standard) : []

  // 모델 크기 읽기 → 핀·치수선 위치
  useEffect(() => {
    const el = mv.current
    if (!el) return
    setBox(null)
    const onLoad = () => setBox({ c: el.getBoundingBoxCenter(), s: el.getDimensions() })
    el.addEventListener('load', onLoad)
    if (el.loaded) onLoad()
    return () => el.removeEventListener('load', onLoad)
  }, [src])

  // 치수선: 앞면 모서리 핀 3개(왼위·오른위·왼아래)의 화면 위치를 이어 그림
  const drawDims = useCallback(() => {
    const st = stage.current
    if (!st) return
    const r = st.getBoundingClientRect()
    const at = (n: string) => {
      const e = st.querySelector<HTMLElement>(`[slot="hotspot-${n}"]`)
      if (!e) return null
      const b = e.getBoundingClientRect()
      return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top] as const
    }
    const tl = at('dim-tl'), tr = at('dim-tr'), bl = at('dim-bl')
    // 옆·뒤에서 보면 앞면 가로선이 짧아져 겹침 → 숨김
    if (!tl || !tr || !bl || Math.hypot(tr[0] - tl[0], tr[1] - tl[1]) < 80) return setDims(null)
    setDims({ w: [tl[0], tl[1] - 26, tr[0], tr[1] - 26], h: [bl[0] - 34, tl[1], bl[0] - 34, bl[1]] })
  }, [])
  useEffect(() => {
    const el = mv.current
    if (!el || !box) return
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawDims) }
    el.addEventListener('camera-change', on)
    on()
    return () => { el.removeEventListener('camera-change', on); cancelAnimationFrame(raf) }
  }, [box, drawDims])

  if (!p || !m3) return <section className="section"><p>3D 모델이 없는 상품이에요. <Link to="/products" className="link">목록으로</Link></p></section>

  const goView = (k: ViewKey) => {
    setView(k)
    setAuto(false)
    // 자동 회전은 모델 자체를 돌리므로 먼저 원래 방향으로 되돌림
    if (mv.current) { mv.current.resetTurntableRotation(0); mv.current.cameraOrbit = orbitOf(k) }
  }
  const pick = (i: number | null) => {
    setSel(i)
    if (i != null) { setPins(true); goView(marks[i].view) }
  }
  const zoom = (f: number) => {
    const el = mv.current
    if (!el) return
    const o = el.getCameraOrbit()
    setAuto(false)
    el.cameraOrbit = `${o.theta}rad ${o.phi}rad ${o.radius * f}m`
  }
  const reset = () => {
    setSel(null)
    setView('front')
    setAuto(true)
    if (mv.current) { mv.current.resetTurntableRotation(0); mv.current.cameraOrbit = orbitOf('front'); mv.current.fieldOfView = 'auto' }
  }
  const ar = () => {
    const el = mv.current
    if (el?.canActivateAR) el.activateAR()
    else flash('휴대폰에서 이 화면을 열면 내 방에 놓아볼 수 있어요')
  }
  const changeGrade = (g: Grade) => { setGrade(g); setSel(null); setView('front'); setAuto(true) }
  const rent = (go: boolean) => {
    addToCart({ productId: p.id, mode: 'long', grade, months: Math.max(4, p.minMonths), weeks: 1, plan: 'full' })
    if (go) nav('/checkout'); else flash('꾸러미에 담았어요')
  }
  const room = p.specs.find(([k]) => k === '방 크기')?.[1]
  const cat = CATEGORIES.find((c) => c.key === p.category)?.name

  return (
    <section className="section v3d-page">
      <p className="faint v3d-crumb"><Link to="/products">빌리기</Link> / <Link to={`/products?cat=${p.category}`}>{cat}</Link> / <Link to={`/products/${p.id}`}>{p.name}</Link> / 3D로 보기</p>
      <Link to={`/products/${p.id}`} className="v3d-back">← 상품 상세로 돌아가기</Link>

      <div className="v3d-row">
        {/* 3D 뷰어 */}
        <div className="v3d-stage" ref={stage}>
          <div className="v3d-orbit" aria-hidden="true" />
          <model-viewer
            key={src}
            ref={mv}
            src={src}
            alt={`${p.name} 3D 모델`}
            camera-controls=""
            touch-action="pan-y"
            camera-orbit={orbitOf('front')}
            min-camera-orbit="auto auto 60%"
            max-camera-orbit="auto auto 260%"
            interaction-prompt="none"
            shadow-intensity="1"
            shadow-softness="0.9"
            environment-image="neutral"
            exposure="0.85"
            ar=""
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            {...(auto ? { 'auto-rotate': '', 'auto-rotate-delay': '0', 'rotation-per-second': '18deg' } : {})}
            onPointerDown={() => setAuto(false)}
            class="v3d-mv"
          >
            {box && (
              <>
                {(['tl', 'tr', 'bl'] as const).map((k) => (
                  <span key={k} slot={`hotspot-dim-${k}`} className="v3d-dimdot" data-position={pos(box, k === 'tl' ? [-1, 1, 1] : k === 'tr' ? [1, 1, 1] : [-1, -1, 1])} />
                ))}
                {pins && marks.map((m, i) => (
                  <button
                    key={`${src}-${i}`}
                    slot={`hotspot-mark-${i}`}
                    className={`v3d-pin ${sel === i ? 'on' : ''}`}
                    data-position={pos(box, m.at)}
                    data-normal={normalOf(m.at)}
                    onClick={(e) => { e.stopPropagation(); pick(sel === i ? null : i) }}
                    aria-label={`흠집 ${i + 1}: ${m.title}`}
                  >
                    {i + 1}
                    {sel === i && (
                      <span className="v3d-bubble" onClick={(e) => e.stopPropagation()}>
                        <b>{CIRCLED[i]} {m.title}</b>
                        <em>{[m.note, m.charge].filter(Boolean).join(' · ')}</em>
                        <span role="button" tabIndex={0} className="v3d-bubble-link" onClick={() => setPhoto(true)} onKeyDown={(e) => e.key === 'Enter' && setPhoto(true)}>출고 사진 보기 ›</span>
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
            <div slot="progress-bar" />
          </model-viewer>

          {m3.size && dims && (
            <svg className="v3d-dims" aria-hidden="true">
              <line x1={dims.w[0]} y1={dims.w[1]} x2={dims.w[2]} y2={dims.w[3]} />
              <line x1={dims.w[0]} y1={dims.w[1] - 7} x2={dims.w[0]} y2={dims.w[1] + 7} />
              <line x1={dims.w[2]} y1={dims.w[3] - 7} x2={dims.w[2]} y2={dims.w[3] + 7} />
              <line x1={dims.h[0]} y1={dims.h[1]} x2={dims.h[2]} y2={dims.h[3]} />
              <line x1={dims.h[0] - 7} y1={dims.h[1]} x2={dims.h[0] + 7} y2={dims.h[1]} />
              <line x1={dims.h[2] - 7} y1={dims.h[3]} x2={dims.h[2] + 7} y2={dims.h[3]} />
            </svg>
          )}
          {m3.size && dims && (
            <>
              <span className="v3d-dimtext" style={{ left: (dims.w[0] + dims.w[2]) / 2, top: Math.min(dims.w[1], dims.w[3]) - 26, transform: 'translateX(-50%)' }}>가로 {m3.size.w}cm · 깊이 {m3.size.d}cm</span>
              <span className="v3d-dimtext right" style={{ left: dims.h[0] - 10, top: (dims.h[1] + dims.h[3]) / 2, transform: 'translate(-100%,-50%)' }}>높이<br />{m3.size.h}cm</span>
            </>
          )}
          {!box && <span className="v3d-loading">3D 모델 불러오는 중…</span>}

          <span className="v3d-chip dark v3d-tl">3D · 실물 스캔</span>
          <div className="v3d-views" role="group" aria-label="시점">
            {VIEWS.map((v) => <button key={v.key} className={`v3d-chip btn-like ${view === v.key && !auto ? 'on' : ''}`} onClick={() => goView(v.key)}>{v.label}</button>)}
          </div>

          <p className="v3d-hint">드래그해서 돌려보고, 핀을 누르면 흠집 사진을 볼 수 있어요</p>
          <div className="v3d-tools" role="toolbar" aria-label="뷰어 도구">
            <button className={auto ? 'on' : ''} aria-pressed={auto} onClick={() => setAuto(!auto)}>자동 회전</button>
            <button onClick={() => zoom(0.8)}>확대 +</button>
            <button onClick={() => zoom(1.25)}>축소 −</button>
            <button onClick={reset}>원래대로</button>
            <button className={pins ? 'on' : ''} aria-pressed={pins} onClick={() => { setPins(!pins); setSel(null) }}>흠집 핀</button>
            <button onClick={ar}>내 방에 놓기 (AR)</button>
          </div>
        </div>

        {/* 정보 */}
        <div className="v3d-info">
          <div className="row gap-8"><span className="v3d-chip mint">3D 모델</span><span className="v3d-chip">{m3.scanned} 스캔</span></div>
          <h1 className="v3d-name">{p.name}</h1>
          <p className="v3d-sub">돌려보면서 크기와 실제 상태를 미리 확인해 보세요</p>
          <div className="v3d-price"><b>월 {won(priceOf(p, grade))}</b><span>{grade === 'standard' ? '일반형' : '실속형'} · 보증금 없음</span></div>
          <hr className="v3d-hr" />

          <b className="v3d-h">보고 있는 기기</b>
          <div className="v3d-devices">
            {(['standard', 'value'] as const).filter((g) => g === 'standard' || hasValue).map((g) => (
              <button key={g} className={`v3d-device ${grade === g ? 'on' : ''}`} onClick={() => changeGrade(g)} aria-pressed={grade === g}>
                <b>{g === 'standard' ? '일반형' : '실속형'}</b>
                <small>{p.bought[g]} 매입 · {(g === 'value' ? m3.marks.value ?? [] : m3.marks.standard).length ? `흠집 ${(g === 'value' ? m3.marks.value ?? [] : m3.marks.standard).length}곳` : '흠집 기록 없음'}</small>
              </button>
            ))}
          </div>

          <b className="v3d-h">{marks.length ? `기존 흠집 ${marks.length}곳 · 모델에 핀으로 표시` : '기존 흠집 기록 없음'}</b>
          {marks.map((m, i) => (
            <button key={i} className={`v3d-card ${sel === i ? 'on' : ''}`} onClick={() => pick(sel === i ? null : i)}>
              <b>{CIRCLED[i]} {m.title}</b>
              <small className={m.charge ? 'mint' : ''}>{[m.note, m.charge, sel === i ? '지금 보는 중' : ''].filter(Boolean).join(' · ')}</small>
            </button>
          ))}
          {m3.size && (
            <div className="v3d-card static">
              <b>실제 크기</b>
              <small>가로 {m3.size.w} · 깊이 {m3.size.d} · 높이 {m3.size.h}cm{room ? ` · ${room}` : ''}</small>
            </div>
          )}
          <p className="v3d-note">반납할 때 AI가 이 3D 기록과 반납 사진을 비교해 새로 생긴 흠집만 찾아요.</p>
          <div className="v3d-btns">
            <button className="v3d-btn" onClick={() => rent(true)} disabled={p.stock === 0}>{p.stock === 0 ? '지금은 모두 대여 중' : '이 기기로 빌리기'}</button>
            <button className="v3d-btn line" onClick={() => rent(false)} disabled={p.stock === 0}>꾸러미에 담기</button>
          </div>
        </div>
      </div>

      {photo && sel != null && (
        <Modal onClose={() => setPhoto(false)}>
          <div className="stack gap-12">
            <b>{CIRCLED[sel]} {marks[sel].title}</b>
            <div className="v3d-photo" style={{ background: p.bg }}><ProductArt p={p} size={260} /></div>
            <small className="muted">출고 때 찍은 사진 · {m3.scanned} · 반납 때 이 사진과 비교해요</small>
            <button className="btn" onClick={() => setPhoto(false)}>닫기</button>
          </div>
        </Modal>
      )}
      <Toast msg={toast} />
    </section>
  )
}
