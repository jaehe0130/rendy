# 이 라우트가 구현하는 화면

- **0-3 진단 결과 · 공유 카드** (P1) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6894
  - 메모: → 2-4 주문 / 3-2 상담
  - API 모듈: diagnosis · AI: LLM 꾸러미 추천

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
