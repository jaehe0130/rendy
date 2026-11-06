# 이 라우트가 구현하는 화면

- **3-1 AI 상담 시작** (P0) — AIC-01
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7994
  - API: startConsultation
- **3-2 대화 + 추천 꾸러미** (P0) — AIC-02
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8031
  - API: sendConsultationMessage
  - 메모: 서버가 대여 가능 기기만 거르고 요금 계산

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
