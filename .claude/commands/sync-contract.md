---
description: API 계약(openapi.yaml) 변경을 공용 타입과 mock에 반영
---
1. `docs/api/openapi.yaml`과 `ai/vision/contract/openapi.yaml`의 최근 변경(git diff dev)을 확인한다.
2. `packages/shared/src/types/`의 TS 타입을 계약과 일치시킨다.
3. `apps/web/src/lib/api/mocks/`의 mock 응답이 새 스키마를 따르도록 고친다 (프론트 담당 작업일 때만).
4. 바뀐 필드 목록을 요약해 PR 설명에 쓸 수 있게 출력한다.
