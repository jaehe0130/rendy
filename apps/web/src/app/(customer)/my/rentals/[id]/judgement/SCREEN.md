# 이 라우트가 구현하는 화면

- **4-5 파손 판정 (AI 사진 비교)** (P0) — MY-05
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8391
  - API: getJudgement, disputeJudgement
  - 메모: 8-3과 같은 화면 — 8-3 디자인 기준으로 하나만 구현
- **8-3 반납 AI 예비 판정** (P0) — DMG-03 · MY-05
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8971
  - API: getJudgement
  - 메모: 출고/받은 날/반납 3단 비교
- **8-4 과실 파손 · 단계별 내 부담** (P1) — DMG-04
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-9031
  - API: getJudgement (chargeByPlan)
  - 메모: 8-3의 과실 파손 상태

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
