# 이 라우트가 구현하는 화면

- **8-5 [운영자] 최종 판정 · 학습 데이터** (P0) — DMG-05 · ADM-03
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-9077
  - API: listJudgements, finalizeJudgement, redecideJudgement
  - 메모: 프로토타입 /admin/judge

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
