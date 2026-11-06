# 이 라우트가 구현하는 화면

- **6-5 AI 가이드 글 만들기** (P2) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8787
  - 메모: 6-4 번호 없음
  - API 모듈: guides · AI: LLM 가이드 초안

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
