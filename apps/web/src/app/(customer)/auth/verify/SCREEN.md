# 이 라우트가 구현하는 화면

- **1-2 휴대폰 본인인증** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7353
  - 메모: 해커톤은 mock 인증
  - API 모듈: auth · AI: -

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
