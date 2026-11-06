# 렌디 (Rendy) — Claude Code 작업 규칙

성북구 1인 가구 대상 생활가전 렌탈 구독 서비스. 해커톤 프로젝트이며 5개 파트가 한 저장소에서 동시에 작업한다.
**가장 중요한 목표: 커밋 충돌 없이 병렬 개발.** 아래 규칙을 반드시 지킨다.

## 영역과 소유권

| 영역 | 폴더 | 담당 | 기술 |
|---|---|---|---|
| 디자인 | `design/` | 디자인 | Figma, 토큰 JSON |
| 데이터 | `database/`, `packages/shared/policy/` | 데이터 | Prisma, PostgreSQL |
| 백엔드 | `apps/api/` | 백엔드 | NestJS, Prisma Client |
| 프론트 | `apps/web/` | 프론트 | Next.js App Router, Tailwind |
| AI | `ai/` | AI | Python, FastAPI, LLM 프롬프트 |
| 공동 | `docs/api/`, `packages/shared/src/` | 백엔드 주도, 프론트 리뷰 | OpenAPI, TS 타입 |

하위 폴더의 `CLAUDE.md`에 영역별 세부 규칙이 있다. 작업 폴더의 CLAUDE.md를 먼저 읽는다.

## 반드시 지킬 규칙

1. **내 영역 밖 파일은 수정하지 않는다.** 다른 영역 변경이 필요하면 고치지 말고, PR 설명의 "다른 영역 요청" 칸에 적는다.
2. **API는 계약 먼저.** `docs/api/openapi.yaml` 수정 → `packages/shared` 타입 반영 → 구현. 계약 PR은 따로 올린다(작고 빠르게 머지).
3. **DB 스키마는 `database/prisma/schema.prisma`에서만** 바꾼다. 마이그레이션 파일은 데이터 담당만 생성한다.
4. **정책 숫자는 하드코딩 금지.** 2cm 생활 마모 기준, 보장 단계 요금, 이의 신청 48시간 등은 `packages/shared/policy/damage-policy.json`에서 읽는다. (TS와 Python 모두 이 파일을 읽는다)
5. **디자인 값은 `design/tokens/`에서.** 색·폰트·간격을 컴포넌트에 직접 쓰지 않는다.
6. **AI 서비스는 HTTP 계약으로만 연결.** 백엔드는 `ai/vision/contract/openapi.yaml`만 보고 호출한다. AI 미완성 시 `VISION_MOCK=1`로 고정 응답을 쓴다.
7. **AI가 최종 판정한다고 쓰지 않는다.** UI 문구·API 필드명 모두 "예비 판정(AI)" / "최종 판정(운영자)"를 구분한다.
8. 의존성 추가는 해당 영역 `package.json`/`requirements.txt`에만. 루트 lockfile 충돌 시 직접 고치지 말고 `pnpm install`로 재생성.

## 브랜치 · 커밋

- `main` 배포용 · `dev` 통합용 · 작업은 `feat/<영역>-<내용>` (예: `feat/web-screen-8-3`, `feat/api-inspections`, `feat/ai-compare-mock`)
- 커밋: `feat(web): 8-3 반납 AI 예비 판정 화면` / `fix(api): ...` / `chore(db): ...` / `docs: ...`
- `dev`로 PR, 작게 자주. 하루 2번 이상 `dev`를 내 브랜치에 merge.

## 자주 쓰는 명령

```bash
pnpm dev:web      # 프론트
pnpm dev:api      # 백엔드
pnpm db:up        # 로컬 Postgres (docker)
pnpm db:migrate   # 마이그레이션 (데이터 담당)
pnpm db:seed      # 시드
pnpm ai:dev       # 비전 서비스 (ai/vision)
```

## 화면 구현

화면 번호와 Figma 링크는 `docs/screens.md`. `/implement-screen <번호>` 명령을 쓴다.
