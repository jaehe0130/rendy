# 이 라우트가 구현하는 화면

- **2-4 주문하기 · 꾸러미** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7861
  - 메모: 3-3, 7-5와 같은 컴포넌트
  - API 모듈: orders · AI: -
- **3-3 꾸러미 주문하기** (P1) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8102
  - 메모: /checkout?bundle= 재사용
  - API 모듈: orders · AI: -
- **7-5 쿠폰 적용 결제** (P2) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7156
  - 메모: /checkout에 쿠폰 상태
  - API 모듈: orders, coupons · AI: -

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
