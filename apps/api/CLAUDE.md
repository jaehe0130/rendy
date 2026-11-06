# apps/api — 백엔드 담당 영역 (NestJS + Prisma)

## 구조
```
src/
├─ modules/<도메인>/    controller · service · dto (도메인별 폴더 = 충돌 단위)
├─ common/              가드(인증·관리자), 필터, 파이프
└─ app.module.ts        모듈 등록 — 맨 아래 줄에만 추가
```

## 규칙
- 엔드포인트는 `docs/api/openapi.yaml`에 먼저 추가한 뒤 구현. 응답 타입은 `@rendy/shared`.
- DB 스키마는 `database/prisma/schema.prisma` (수정은 데이터 담당에게 요청).
- **inspections 모듈**: 사진 저장 → `ai-gateway`로 `ai/vision` 호출 → `DamageFinding` 저장 →
  `needsReview`면 상태 `NEEDS_REVIEW` → 고객 부담은 `@rendy/shared`의 `customerCharge()`로 계산.
- **8-5 최종 판정**: AI와 다른 `finalClass`면 `overrideReason` 필수(400). 확정 시 `usedForTraining=true` 후보로 표시.
- **ai-gateway 모듈**: 비전 서비스 HTTP 호출 + LLM 호출. 프롬프트는 `ai/llm/prompts/*.md`를 읽기만 한다(수정은 AI 담당).
- 인증은 해커톤 mock: 인증번호 `000000` 통과, `isAdmin` 사용자는 `/admin/*` 허용.
- `apps/api/` 밖 파일은 수정하지 않는다.
