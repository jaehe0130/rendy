# 이 라우트가 구현하는 화면

- **1-1 메인 (가입 전)** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7284
  - 메모: 2-1과 같은 라우트, 로그인 상태로 분기
  - API 모듈: products · AI: -
- **2-1 메인 (가입 후)** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7503
  - 메모: 내 렌탈 요약 카드
  - API 모듈: products, rentals · AI: -

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
