# database/ — 데이터 담당 영역

- 스키마: `prisma/schema.prisma` (단일 파일). apps/api가 이 경로를 참조한다.
- **마이그레이션은 데이터 담당만 생성**: `pnpm db:migrate --name <설명>`. 다른 사람은 스키마 변경을 이슈로 요청.
- 시드: `seed/` JSON을 고치고 `seed.ts`가 읽는다. 데모 시나리오(D-0412 생활 마모, B-0107 과실 파손)가 항상 재현되게 유지.
- enum 이름·값은 `docs/api/openapi.yaml`과 일치시킨다.
- 정책 숫자는 DB가 아니라 `packages/shared/policy/damage-policy.json`.
