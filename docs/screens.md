# 화면 맵 (기능명세서 v3.2 → 와이어프레임 → 라우트 → API)

> 기준: `design/spec/기능명세서.md` v3.2 (우선순위·기능 ID). 화면 번호를 누르면 Figma 프레임으로 이동.
> 라우트는 디자인 프로토타입(`design/prototype/src/App.tsx`) 경로에 맞췄다. API 칸은 `docs/api/openapi.yaml`의 operationId.
> 프론트 구현: `/implement-screen 8-3` 처럼 화면 번호만 넘기면 된다.

**우선순위** — P0 해커톤 시연 필수 · P1 있으면 좋음 · P2 출시 후 (명세서 기준)

## 데모 동선 (P0)

```
1-1 메인 → 1-2 로그인·가입 → 2-2 목록 → 2-3 상세 → 2-4 주문 → 2-5 결제 완료
   → [운영자] 8-1 출고 검사 (6면 AI 기준 사진) → ADM-09 출발
   → 4-1 내 렌탈 → 8-2 받은 날 확인
   → 4-4 반납 사진 → 8-3 AI 예비 판정 (D-0412 생활 마모) / 8-4 (B-0107 과실 파손) → 4-6 완료
   → [운영자] 8-5 최종 판정 → 재학습 데이터 적재
```

## FLOW 0 유입 · 가이드 · 진단

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [0-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6740) | 가전 가이드 글 | `/guide/[slug]` | GUIDE-01~04 | getGuide | P0 | 비회원 열람. AI 초안·운영자 검수 표시 |
| [0-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6863) | 1분 진단 | `/quiz` | GUIDE-05 | createDiagnosis | P0 | 로그인 없이 4문항 |
| [0-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6894) | 진단 결과 · 공유 카드 | `/quiz/[shareCode]` | GUIDE-06 | getDiagnosis | P1 | → 2-4 꾸러미 / 3-2 상담 |

## FLOW 1 시작 · 로그인 · 회원가입

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [1-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7284) | 메인 (가입 전) | `/` | AUTH-01 · AUTH-02 | listProducts, getMe | P0 | 2-1과 같은 라우트, 로그인 여부로 분기 |
| [1-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7353) | 로그인 · 회원가입 (휴대폰 인증) | `/login` | AUTH-03 | requestOtp | P0 | v3.2: 로그인·가입 한 화면 |
| [1-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7390) | 인증번호 · 약관 (처음 가입) | (`/login` 안 상태) | AUTH-04 | verifyOtp | P0 | 필수 약관 3개 |
| 1-3R | 다시 온 회원 바로 로그인 | (`/login` 안 상태) | AUTH-06 | verifyOtp | P0 | 와이어프레임 없음 — 약관 없이 "다시 오셨네요" |
| [1-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7438) | 가입 완료 · 맞춤 설정 | `/welcome` | AUTH-05 | updateMe | P1 |  |

## FLOW 2 빌리기

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [2-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7503) | 메인 (가입 후) | (`/` 안 상태) | RENT-01 | getMe, listProducts | P0 | 내 렌탈 요약 |
| [2-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7568) | 상품 목록 | `/products` | RENT-02 · RENT-03 | listProducts | P0 | 품절도 "대기 n명"으로 표시 |
| [2-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7645) | 상품 상세 | `/products/[key]` | RENT-04 · 07 · 13 · 14 | getProduct, quote | P0 | 다음 배정 기기 · 총비용 · 절약 리포트 · 처리 기준표 |
| [2-3W](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7942) | 품절 · 대기 명단 | (`/products/[key]` 안 상태) | RENT-06 | joinWaitlist | P0 |  |
| [2-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7861) | 주문하기 · 꾸러미 | `/checkout` | RENT-09 · RENT-10 | getCart, quote, createOrder, payOrder | P0 | 2-4·3-3·7-5 공통 화면 |
| 2-5 | 결제 완료 | `/complete` | RENT-11 | getOrder | P0 | 와이어프레임 없음 (프로토타입 /complete) |
| QR | 기기 이력 (QR) | `/devices/[code]` | RENT-14 | getDeviceHistory | P1 | 와이어프레임 없음. 비회원 열람 |

## FLOW 3 AI 살림 상담

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [3-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7994) | AI 상담 시작 | `/ai` | AIC-01 | startConsultation | P0 |  |
| [3-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8031) | 대화 + 추천 꾸러미 | (`/ai` 안 상태) | AIC-02 | sendConsultationMessage | P0 | 서버가 대여 가능 기기만 거르고 요금 계산 |
| [3-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8102) | 꾸러미 주문 | (`/checkout` 안 상태) | AIC-03 | replaceCart | P1 | /checkout 재사용 |

## FLOW 4 내 렌탈 · 연장 · 교체 · 반납

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [4-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8183) | 내 렌탈 | `/my` | MY-01 | listMyRentals | P0 | 받은 날 확인 배너 → 8-2 |
| [4-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8248) | 연장 (팝업) | (`/my` 안 상태) | MY-02 | getExtensionOptions, extendRental | P1 | 개월 / 마무리 1주 |
| [4-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8297) | 교체할 물건 고르기 | `/my/rentals/[id]/swap` | MY-03 | swapRental | P1 |  |
| [4-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8339) | 반납 신청 · 상태 사진 | `/my/rentals/[id]/return` | MY-04 | requestReturn | P0 | 사진 3장 필수 → 8-3 |
| [4-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8391) | 파손 판정 (AI 사진 비교) | (`/my/rentals/[id]/judgement` 안 상태) | MY-05 | getJudgement, disputeJudgement | P0 | 8-3과 같은 화면 — 8-3 디자인 기준으로 하나만 구현 |
| [4-6](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8444) | 반납 신청 완료 | `/my/rentals/[id]/return/done` | MY-06 | getRental | P1 | 팔기 제안 |
| MY | 결제 수단 · 쿠폰함 · 설정 | `/my/settings` | MYP-01~04 | listPaymentMethods, listMyCoupons | P0 | 와이어프레임 없음 (MYP-01만 P0) |

## FLOW 5 팔기 (중고 매입 · 바이백)

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [5-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8480) | 팔기 안내 | `/sell` | SELL-01 | — | P0 |  |
| [5-A1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8516) | 팔기 · 예상 매입가 | `/sell/quote` | SELL-02 | quoteBuyback | P0 | v3.2: AI 견적 삭제 → 계산식. 와이어프레임 'AI 매입 견적' 문구 수정 필요 |
| [5-A2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8570) | 수거 · 정산 완료 | `/sell/[id]` | SELL-03 | scheduleBuybackPickup, getBuyback, consentBuyback | P0 |  |

## FLOW 6 운영자

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [6-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8611) | 입고 · 검수 · 등급 · 매입 정산 | `/admin` | ADM-01 · ADM-02 | listIntake, gradeDevice, inspectBuyback, payBuyback | P0 | 프로토타입 /admin |
| [6-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8678) | 상품 등록 (AI 초안) | `/admin/products/new` | ADM-04 | draftDevice, registerDevice | P0 |  |
| [6-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8723) | 가동률 · 대기 명단 대시보드 | `/admin/dashboard` | ADM-05 | getDashboard | P0 |  |
| [6-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8787) | AI 가이드 글 만들기 | `/admin/guides/new` | ADM-07 | (추가 예정) | P1 |  |
| ADM-09 | 배송 · 회수 일정 | `/admin/deliveries` | ADM-09 | listDeliveries, updateDeliveryStatus | P0 | 와이어프레임 없음 (화면 추가 예정) |
| ADM-10 | 세척 · 점검 체크리스트 | `/admin/devices/[id]` | ADM-10 | addWorkLog | P1 | 와이어프레임 없음 |

## FLOW 7 학교 인증 마케팅

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [7-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6971) | 학교 인증 혜택 랜딩 | `/school` | MKT-01 | listSchools | P0 | 프로토타입 /school |
| [7-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7041) | 학교 인증 | `/school/verify` | MKT-02 | sendSchoolEmailCode, confirmSchoolEmailCode, submitStudentCard | P0 |  |
| [7-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7067) | 혜택 지급 · 친구 초대 | `/school/welcome` | MKT-03 · MKT-04 | confirmSchoolEmailCode, getMyInvite | P0 | 초대는 P1 |
| [7-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7113) | 우리 학교 페이지 | `/school/[schoolId]` | MKT-05 · MKT-06 | listSchools | P1 |  |
| [7-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7156) | 쿠폰 적용 결제 | (`/checkout` 안 상태) | MKT-07 | quote, createOrder | P0 | 쿠폰 자동 적용 상태 |
| [7-6](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7210) | 관리자 · 학교 캠페인 | `/admin/campaigns` | ADM-08 | getSchoolCampaigns, reviewStudentCard | P1 |  |

## FLOW 8 AI 파손 판정 · 단계별 보장

| # | 화면 | 라우트 | 기능 ID | API | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [8-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8860) | [운영자] 출고 검사 · AI 기준 사진 | `/admin/outbound/[deviceId]` | DMG-01 | outboundInspection, confirmOutbound | P0 | 6면 촬영 |
| [8-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8926) | 받은 날 상태 확인 | `/my/rentals/[id]/receive` | DMG-02 · MY-09 | submitReceivedCheck | P0 | 24시간 안 |
| [8-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8971) | 반납 AI 예비 판정 | `/my/rentals/[id]/judgement` | DMG-03 · MY-05 | getJudgement | P0 | 출고/받은 날/반납 3단 비교 |
| [8-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-9031) | 과실 파손 · 단계별 내 부담 | (`/my/rentals/[id]/judgement` 안 상태) | DMG-04 | getJudgement (chargeByPlan) | P1 | 8-3의 과실 파손 상태 |
| [8-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-9077) | [운영자] 최종 판정 · 학습 데이터 | `/admin/judge` | DMG-05 · ADM-03 | listJudgements, finalizeJudgement, redecideJudgement | P0 | 프로토타입 /admin/judge |

