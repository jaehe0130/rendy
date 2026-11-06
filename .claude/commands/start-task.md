---
description: 작업 시작 — 브랜치 만들고 영역 규칙 확인 (예: /start-task api inspections)
---
인자: $ARGUMENTS  (첫 단어 = 영역 web|api|db|ai|design, 나머지 = 작업 이름)

1. `git checkout dev && git pull` 후 `feat/<영역>-<작업이름>` 브랜치를 만든다.
2. 해당 영역의 CLAUDE.md를 읽고 수정 가능한 폴더를 확인해 알려준다.
3. 관련 화면이 있으면 `docs/screens.md`에서 찾아 링크를 보여준다.
