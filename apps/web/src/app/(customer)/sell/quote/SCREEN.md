# 이 라우트가 구현하는 화면

- **5-A1 팔기 · 예상 매입가** (P0) — SELL-02
  - Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8516
  - API: quoteBuyback
  - 메모: v3.2: AI 견적 삭제 → 계산식. 와이어프레임 'AI 매입 견적' 문구 수정 필요

구현 순서: 명세서 기능 정의 확인 → Figma MCP로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
금액 미리보기는 `@rendy/shared`의 pricing 함수, 확정 금액은 항상 API 응답.
