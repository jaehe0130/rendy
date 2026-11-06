# 이 라우트가 구현하는 화면

- **1-1 메인 (가입 전)** (P0) — AUTH-01 · AUTH-02
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7284
  - API: listProducts, getMe
  - 메모: 2-1과 같은 라우트, 로그인 여부로 분기
- **2-1 메인 (가입 후)** (P0) — RENT-01
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7503
  - API: getMe, listProducts
  - 메모: 내 렌탈 요약

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
