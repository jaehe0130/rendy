---
description: API 계약(openapi.yaml) 변경을 공용 타입과 mock에 반영
---
1. `docs/api/openapi.yaml`과 `ai/vision/contract/openapi.yaml`의 최근 변경(git diff dev)을 확인한다.
2. `pnpm --filter @rendy/shared gen:api`로 `api.gen.ts`를 다시 만들고, 새 스키마면 `types/models.ts`에 별칭을 추가한다. enum이 바뀌면 `types/enums.ts`와 `database/prisma/schema.prisma`도 맞춘다.
3. `apps/web/src/lib/api/mocks/`의 mock 응답이 새 스키마를 따르도록 고친다 (프론트 담당 작업일 때만).
4. 바뀐 필드 목록을 요약해 PR 설명에 쓸 수 있게 출력한다.
