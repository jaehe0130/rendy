# 이 라우트가 구현하는 화면

- **2-4 주문하기 · 꾸러미** (P0) — RENT-09 · RENT-10
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7861
  - API: getCart, quote, createOrder, payOrder
  - 메모: 2-4·3-3·7-5 공통 화면
- **3-3 꾸러미 주문** (P1) — AIC-03
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8102
  - API: replaceCart
  - 메모: /checkout 재사용
- **7-5 쿠폰 적용 결제** (P0) — MKT-07
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7156
  - API: quote, createOrder
  - 메모: 쿠폰 자동 적용 상태

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
