# 이 라우트가 구현하는 화면

- **3-1 AI 상담 시작** (P1) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7994
  - API 모듈: consult · AI: LLM 상담
- **3-2 대화 + 추천 꾸러미** (P1) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8031
  - 메모: 3-1의 대화 진행 상태
  - API 모듈: consult · AI: LLM 상담

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
