// 메인 3D 미리보기 — 실물 스캔(GLB)을 자동으로 돌려 보여 주고, 자세히는 2-3a 3D 화면으로
// model-viewer가 커서 HomeRendy에서 화면에 가까워졌을 때만 불러옴 (lazy)
import '@google/model-viewer'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, lowest, won } from '../data'

const LIST = PRODUCTS.filter((p) => p.model3d)

export default function Home3D() {
  const [id, setId] = useState(LIST[0].id)
  const p = LIST.find((x) => x.id === id)!
  const marks = p.model3d!.marks.standard
  return (
    <div className="rd-3d">
      <div className="rd-3d-stage" style={{ background: p.bg }}>
        <model-viewer key={p.id} src={p.model3d!.src.standard} alt={`${p.name} 3D 스캔`} camera-controls="" auto-rotate="" auto-rotate-delay="0" rotation-per-second="24deg" interaction-prompt="none" shadow-intensity="1" exposure="1.05" camera-orbit="30deg 75deg 210%" touch-action="pan-y" style={{ width: '100%', height: '100%', background: 'transparent' }} />
        <span className="rd-3d-hint">손가락으로 돌려 보세요</span>
      </div>
      <div className="stack gap-12 rd-3d-side">
        <div className="chips">{LIST.map((x) => <button key={x.id} className={`chip ${id === x.id ? 'on' : ''}`} onClick={() => setId(x.id)}>{x.name}</button>)}</div>
        <b style={{ fontSize: 22 }}>{p.name} · 월 {won(lowest(p))}~</b>
        <span className="muted" style={{ fontSize: 14 }}>{p.model3d!.scanned} 실물 스캔{p.model3d!.size ? ` · ${p.model3d!.size.w}×${p.model3d!.size.d}×${p.model3d!.size.h}cm` : ''}</span>
        <div className="stack gap-4">
          <span className="faint" style={{ fontSize: 13 }}>이 기기에 원래 있던 흔적 {marks.length}곳 (반납 때 책임 없음)</span>
          {marks.map((m) => <span key={m.title} style={{ fontSize: 14 }}>· {m.title} <span className="faint">{m.note}</span></span>)}
        </div>
        <Link to={`/products/${p.id}/3d`} className="btn">흠집 위치까지 3D로 자세히 보기 ›</Link>
      </div>
    </div>
  )
}
