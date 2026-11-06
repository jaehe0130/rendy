# 이 라우트가 구현하는 화면

- **1-2 로그인 · 회원가입 (휴대폰 인증)** (P0) — AUTH-03
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7353
  - API: requestOtp
  - 메모: v3.2: 로그인·가입 한 화면
- **1-3 인증번호 · 약관 (처음 가입)** (P0) — AUTH-04
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7390
  - API: verifyOtp
  - 메모: 필수 약관 3개
- **1-3R 다시 온 회원 바로 로그인** (P0) — AUTH-06
  - Figma: 없음 (프로토타입·명세서 기준)
  - API: verifyOtp
  - 메모: 와이어프레임 없음 — 약관 없이 "다시 오셨네요"

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
