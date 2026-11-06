# 이 라우트가 구현하는 화면

- **8-3 반납 · AI 예비 판정** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8971
  - 메모: 생활 마모 케이스
  - API 모듈: inspections · AI: 비전: 새 흠집 + 길이
- **8-4 과실 파손 · 보장 단계별 내 부담** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-9031
  - 메모: 8-3의 과실 파손 상태
  - API 모듈: inspections · AI: 비전 결과 사용

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
