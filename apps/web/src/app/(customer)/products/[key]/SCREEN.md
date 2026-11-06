# 이 라우트가 구현하는 화면

- **2-3 상품 상세** (P0) — RENT-04 · 07 · 13 · 14
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7645
  - API: getProduct, quote
  - 메모: 다음 배정 기기 · 총비용 · 절약 리포트 · 처리 기준표
- **2-3W 품절 · 대기 명단** (P0) — RENT-06
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7942
  - API: joinWaitlist

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
