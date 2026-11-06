# 이 라우트가 구현하는 화면

- **8-1 [운영자] 출고 검사 · AI 기준 사진** (P0) — Figma: https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8860
  - 메모: 6면 촬영 → 기준 사진
  - API 모듈: inspections · AI: 비전: 기존 흠집 탐지

구현 순서: Figma MCP `get_design_context`로 화면 읽기 → `design/tokens` 값 사용 →
`docs/api/openapi.yaml` 기준 mock으로 먼저 붙이고 → API 준비되면 교체.
