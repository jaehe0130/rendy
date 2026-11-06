# 이 라우트가 구현하는 화면

- **2-5 결제 완료** (P0) — RENT-11
  - Figma: 없음 (프로토타입·명세서 기준)
  - API: getOrder
  - 메모: 와이어프레임 없음 (프로토타입 /complete)

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
