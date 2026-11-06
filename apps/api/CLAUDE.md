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
- 기준 문서: `design/spec/기능명세서.md` v3.2. 상태 전이는 부록 D 값만 쓰고, 바뀔 때마다 `StatusHistory`에 기록(SYS-01).
- **금액·기간 계산은 `@rendy/shared`의 `pricing.ts`만 사용** (첫 결제·총비용·배송비·쿠폰·종료일·1주 연장·매입 견적). 화면과 같은 함수라 숫자가 어긋나지 않는다.
- **judgements 모듈** (DMG-01~05, MY-05, MY-09): 사진 URL 저장 → `ai-gateway`로 `ai/vision` 호출 → `Finding` 저장(신뢰도 등급은 `confidenceLevel()`) →
  고객 부담은 `customerCharge()` · 단계 비교는 `chargeByPlan()` · 상태 점수는 `conditionScore()`. `needsReview`나 LOW면 고객에게 "확인 중".
- **최종 판정(/admin/judgements/:id/finalize)**: AI와 다른 `finalClass`면 `overrideReason` 필수(400). 확정된 Finding은 재학습 데이터(`usedForTraining`).
- **사진 업로드**: 브라우저 → Vercel Blob 직접(`uploads` 모듈이 `handleUpload` 토큰 발급). API 본문에는 URL만 (Vercel 함수 본문 4.5MB 제한).
- **예약**: 주문 생성 시 기기 15분 `RESERVED`, 대기자 배정 24시간. 만료 처리는 Vercel Cron.
- **AI는 금액·재고·최종 판정·매입가를 정하지 않는다** (SYS-10). AI 실행은 `AiRun`에 기록하고, 실패하면 숫자만/운영자 판정/빈 양식으로 대체.
- **ai-gateway 모듈**: 비전 서비스 HTTP 호출 + LLM 호출. 프롬프트는 `ai/llm/prompts/*.md`를 읽기만 한다(수정은 AI 담당).
- 인증은 해커톤 mock: 인증번호 `000000` 통과, `isAdmin` 회원만 `/admin/*`. 권한 표는 명세서 부록 F.
- `apps/api/` 밖 파일은 수정하지 않는다.
