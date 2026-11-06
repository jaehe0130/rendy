---
description: 와이어프레임 화면 번호로 프론트 화면 구현 (예: /implement-screen 8-3)
---
화면 번호: $ARGUMENTS

1. `docs/screens.md`에서 이 번호의 Figma 링크, 라우트, API 모듈, 우선순위를 찾는다. 라우트 폴더의 `SCREEN.md`도 읽는다.
2. Figma MCP로 디자인을 읽는다: 디자인 페이지에 같은 화면이 있으면 그것을, 없으면 와이어프레임 프레임을 기준으로 한다.
3. `apps/web/CLAUDE.md` 규칙대로 구현한다. 화면 로직은 `src/features/<도메인>/`, 라우트 파일은 얇게.
4. 데이터는 `packages/shared` 타입과 `docs/api/openapi.yaml` 기준 mock으로 먼저 연결한다.
5. `apps/web/` 밖의 파일은 수정하지 않는다. 필요한 API·타입 변경은 마지막에 목록으로 정리해 알려준다.
6. 브랜치 `feat/web-screen-$ARGUMENTS`에 커밋한다.
