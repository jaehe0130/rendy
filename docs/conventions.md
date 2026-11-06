# 협업 규칙 — 충돌 없이 병렬 개발하기

## 왜 충돌이 나는가
같은 파일을 두 사람이 동시에 고치기 때문. 이 저장소는 **폴더 = 담당자**로 나눠서 그 일을 구조적으로 막는다.

## 충돌이 잘 나는 지점과 대응

| 파일 | 대응 |
|---|---|
| `pnpm-lock.yaml` | 직접 고치지 않는다. 충돌 나면 `dev` 버전 받고 `pnpm install`로 재생성 |
| `database/prisma/schema.prisma` | 데이터 담당만 수정. 다른 사람은 이슈로 요청 |
| `docs/api/openapi.yaml` | 계약 변경만 담은 작은 PR로 먼저 머지 |
| `apps/api/src/app.module.ts` | 모듈 등록 줄만 맨 아래에 추가 (중간 삽입 금지) |
| `apps/web/src/app/layout.tsx`, 공용 네비 | 프론트 리드 1명만 수정 |
| `packages/shared/policy/damage-policy.json` | 데이터+AI 합의 후 1명이 수정 |

## 브랜치 흐름

```
main  ← 발표 직전에만
 └ dev ← PR로만 머지 (리뷰 1명)
    ├ feat/web-screen-2-3
    ├ feat/api-inspections
    ├ feat/ai-compare-mock
    └ feat/db-schema-inspection
```

## 커밋 메시지
`<type>(<영역>): <내용>` — type: feat, fix, chore, docs, refactor / 영역: web, api, db, ai, design, shared

## 하루 리듬 (해커톤)
1. 시작할 때 `dev` 받기
2. 2~3시간마다 작은 PR
3. 계약(API·정책)이 바뀌면 단톡에 한 줄 공지
