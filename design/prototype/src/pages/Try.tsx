import { Link } from 'react-router-dom'
import { ReturnCompare } from '../ReturnCompare'

// 심사위원 체험: 실제 반납 흐름 그대로 — 출고 사진은 렌디가 찍어 둔 것, 사용자는 반납 사진만 올려 AI 예비 판정을 받는다
export default function Try() {
  return (
    <section className="section bg-surface try">
      <div className="stack gap-8" style={{ marginBottom: 20 }}>
        <span className="eyebrow">AI 반납 판정 체험</span>
        <h1 className="serif" style={{ fontSize: 'clamp(28px,6vw,44px)' }}>반납 사진만 찍으면<br />AI가 비교해요</h1>
        <p className="muted">렌디는 보내기 전에 기기를 찍어 둬요. 반납할 때 같은 각도로 찍으면 AI가 새로 생긴 흠집만 찾아요.</p>
      </div>
      <div className="panel try-card stack gap-16">
        <ReturnCompare plan="safe" kits={['humidifier', 'dehumidifier-10']} actions={() => (
          <div className="row gap-8 wrap-row">
            <Link to="/admin/judge?demo" className="btn">운영자 최종 판정 보기</Link>
            <Link to="/my?demo" className="btn line">내 렌탈에서 반납해 보기</Link>
          </div>
        )} />
      </div>
    </section>
  )
}
