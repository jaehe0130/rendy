# 이 라우트가 구현하는 화면

- **2-3 상품 상세 · 장기** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7645
  - 메모: 기기 이력·파손 처리 기준 표
  - API 모듈: products, devices · AI: LLM 리뷰 요약·비교
- **2-3W 품절 · 대기 명단** (P1) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7942
  - 메모: 2-3의 품절 상태
  - API 모듈: waitlist · AI: -

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
