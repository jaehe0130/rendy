# 이 라우트가 구현하는 화면

- **8-2 받은 날 상태 확인 (고객)** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8926
  - 메모: 24시간 안 이상 신고
  - API 모듈: inspections · AI: 비전: 출고 대비 비교

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
