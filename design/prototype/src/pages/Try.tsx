import { Link } from 'react-router-dom'
import { ReturnCompare } from '../ReturnCompare'

// 심사위원 · 주민 체험: 실제 반납 흐름 그대로 — 출고 사진은 렌디가 찍어 둔 것, 사용자는 반납 사진만 올려 AI 예비 판정을 받는다
// 처음 보는 사람도 알 수 있게: 왜 필요한지(흠집 다툼) → 어떻게 하는지(3단계) → 직접 해 보기
const STEPS: [string, string, string][] = [
  ['1', '보내기 전', '렌디가 기기 사진을 찍어 둬요 (출고 사진)'],
  ['2', '돌려줄 때', '같은 각도로 사진 한 장만 찍어요 (반납 사진)'],
  ['3', 'AI 비교', '두 사진을 비교해 새로 생긴 흠집만 표시하고 길이를 재요'],
]

export default function Try() {
  return (
    <section className="section bg-surface try">
      <div className="stack gap-12" style={{ marginBottom: 20 }}>
        <span className="eyebrow">AI 반납 판정 체험</span>
        <h1 className="serif" style={{ fontSize: 'clamp(26px,6vw,44px)' }}>빌린 가전을 돌려줄 때<br />“이 흠집 원래 있었어요” 다툼 없이</h1>
        <p className="muted">렌탈을 반납할 때 원래 있던 흠집인지 새로 생긴 흠집인지 애매해서 수리비 다툼이 생기곤 해요. 렌디는 AI가 보내기 전 사진과 돌려줄 때 사진을 비교해서, <b>새로 생긴 흠집만</b> 찾아 줘요.</p>
        <div className="try-steps">
          {STEPS.map(([n, a, b]) => <div key={n}><i>{n}</i><b>{a}</b><span>{b}</span></div>)}
        </div>
        <p className="faint" style={{ fontSize: 13 }}>2cm 이하 작은 긁힘은 생활 마모라 0원 · AI는 후보만 보여 주고 최종 판정은 운영자가 해요</p>
      </div>
      <div className="panel try-card stack gap-16">
        <b style={{ fontSize: 17 }}>직접 해 보기 · 아래 예시 사진(긁힘 A·B·C)을 누르고 비교 버튼을 눌러 보세요</b>
        <ReturnCompare plan="safe" kits={['dehumidifier-10', 'dehumidifier-16', 'humidifier', 'mini-dryer', 'foodwaste']} actions={() => (
          <div className="row gap-8 wrap-row">
            <Link to="/my" className="btn line">내 렌탈에서 반납해 보기</Link>
          </div>
        )} />
      </div>
    </section>
  )
}
