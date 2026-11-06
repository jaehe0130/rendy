# 화면 맵 (와이어프레임 → 라우트 → API → 우선순위)

> 소스: Figma `AI 해커톤` 파일의 `와이어프레임` 페이지. 화면 번호를 클릭하면 해당 프레임으로 이동합니다.
> 프론트 구현 시 Claude Code에 `/implement-screen 8-3` 처럼 화면 번호만 넘기면 됩니다.

**우선순위** — P0: 데모 필수 흐름 · P1: AI 스토리 보강 · P2: 시간 남으면 · 삭제: 중복 화면

## 데모 동선 (P0)

```
1-1 메인 → 1-2/1-3 인증 → 2-2 목록 → 2-3 상세 → 2-4 주문
   → [운영자] 8-1 출고 검사 (AI 기준 사진)
   → 4-1 내 렌탈 → 8-2 받은 날 확인
   → 4-4 반납 사진 → 8-3 AI 예비 판정 (생활 마모) / 8-4 (과실 파손) → 4-6 완료
   → [운영자] 8-5 최종 판정 → 재학습 데이터 적재
```

## FLOW 0 유입 · 가이드 · 진단

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [0-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6740) | 가전 가이드 글 | `/guides/[slug]` | guides | LLM 가이드 초안 | P1 | 비회원 열람 |
| [0-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6863) | 1분 진단 | `/diagnosis` | diagnosis | - | P1 | 로그인 없이 4문항 |
| [0-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6894) | 진단 결과 · 공유 카드 | `/diagnosis/result` | diagnosis | LLM 꾸러미 추천 | P1 | → 2-4 주문 / 3-2 상담 |

## FLOW 1 처음 방문 · 본인인증

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [1-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7284) | 메인 (가입 전) | `/` | products | - | P0 | 2-1과 같은 라우트, 로그인 상태로 분기 |
| [1-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7353) | 휴대폰 본인인증 | `/auth/verify` | auth | - | P0 | 해커톤은 mock 인증 |
| [1-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7390) | 인증번호 · 약관 | `/auth/verify/code` | auth | - | P0 | 파손 보장 약관 동의 포함 |
| [1-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7438) | 가입 완료 · 맞춤 설정 | `/onboarding` | users | - | P1 |  |

## FLOW 2 빌리기

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [2-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7503) | 메인 (가입 후) | `/` | products, rentals | - | P0 | 내 렌탈 요약 카드 |
| [2-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7568) | 상품 목록 | `/products` | products | - | P0 | 필터: 상태·출처·받는 방법·재고 |
| [2-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7645) | 상품 상세 · 장기 | `/products/[id]` | products, devices | LLM 리뷰 요약·비교 | P0 | 기기 이력·파손 처리 기준 표 |
| [2-3W](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7942) | 품절 · 대기 명단 | (모달/상태) | waitlist | - | P1 | 2-3의 품절 상태 |
| [2-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7861) | 주문하기 · 꾸러미 | `/checkout` | orders | - | P0 | 3-3, 7-5와 같은 컴포넌트 |

## FLOW 3 AI 살림 상담

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [3-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7994) | AI 상담 시작 | `/consult` | consult | LLM 상담 | P1 |  |
| [3-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8031) | 대화 + 추천 꾸러미 | (모달/상태) | consult | LLM 상담 | P1 | 3-1의 대화 진행 상태 |
| [3-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8102) | 꾸러미 주문하기 | (모달/상태) | orders | - | P1 | /checkout?bundle= 재사용 |

## FLOW 4 렌탈 관리

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [4-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8183) | 내 렌탈 | `/my/rentals` | rentals | - | P0 | 받은 날 확인 배너 → 8-2 |
| [4-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8248) | 연장 (팝업) | (모달/상태) | rentals | - | P1 | 4-1 위 모달 |
| [4-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8297) | 교체할 물건 고르기 | `/my/rentals/[id]/swap` | rentals | - | P2 |  |
| [4-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8339) | 반납 신청 · 상태 사진 | `/my/rentals/[id]/return` | rentals, inspections | 비전 촬영 | P0 | 8-3으로 이어짐 |
| [4-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8391) | AI 파손 판정 (구버전) | (모달/상태) | - | - | 삭제 | 8-3·8-4와 중복 → 8-x로 통일 |
| [4-6](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8444) | 반납 신청 완료 | `/my/rentals/[id]/return/done` | rentals | - | P0 | 팔기 제안 카드 |

## FLOW 5 떠날 때 팔기 (바이백)

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [5-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8480) | 팔기 안내 | `/sell` | buyback | - | P2 |  |
| [5-A1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8516) | 사진 · AI 매입 견적 | `/sell/quote` | buyback | 비전 품목 인식 + 견적 | P2 |  |
| [5-A2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8570) | 검수 · 정산 완료 | `/sell/[id]` | buyback | - | P2 |  |

## FLOW 6 운영 · 검수 · 가동률 (관리자)

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [6-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8611) | 입고 검수 · 등급 | `/admin/intake` | devices | - | P1 |  |
| [6-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8678) | 상품 등록 (AI 초안) | `/admin/products/new` | products | LLM 상품 초안 | P2 |  |
| [6-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8723) | 가동률 · 대기 명단 대시보드 | `/admin/dashboard` | admin-stats | - | P2 |  |
| [6-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8787) | AI 가이드 글 만들기 | `/admin/guides/new` | guides | LLM 가이드 초안 | P2 | 6-4 번호 없음 |

## FLOW 7 학교 인증 마케팅

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [7-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-6971) | 학교 인증 혜택 랜딩 | `/campus` | campus | - | P2 |  |
| [7-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7041) | 학교 인증 | `/campus/verify` | campus | - | P2 |  |
| [7-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7067) | 혜택 지급 · 친구 초대 | `/campus/welcome` | campus, coupons | - | P2 |  |
| [7-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7113) | 우리 학교 페이지 | `/campus/[school]` | campus | - | P2 |  |
| [7-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7156) | 쿠폰 적용 결제 | (모달/상태) | orders, coupons | - | P2 | /checkout에 쿠폰 상태 |
| [7-6](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-7210) | 관리자 · 학교 캠페인 | `/admin/campaigns` | admin-stats | - | P2 |  |

## FLOW 8 AI 파손 판정 · 단계별 파손 보장

| # | 화면 | 라우트 | API 모듈 | AI | 우선 | 메모 |
|---|---|---|---|---|---|---|
| [8-1](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8860) | [운영자] 출고 검사 · AI 기준 사진 | `/admin/outbound/[deviceId]` | inspections | 비전: 기존 흠집 탐지 | P0 | 6면 촬영 → 기준 사진 |
| [8-2](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8926) | 받은 날 상태 확인 (고객) | `/my/rentals/[id]/receive` | inspections | 비전: 출고 대비 비교 | P0 | 24시간 안 이상 신고 |
| [8-3](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-8971) | 반납 · AI 예비 판정 | `/my/rentals/[id]/return/result` | inspections | 비전: 새 흠집 + 길이 | P0 | 생활 마모 케이스 |
| [8-4](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-9031) | 과실 파손 · 보장 단계별 내 부담 | (모달/상태) | inspections | 비전 결과 사용 | P0 | 8-3의 과실 파손 상태 |
| [8-5](https://www.figma.com/design/hGTYP2BthV27WmW86R2oJz/AI-%ED%95%B4%EC%BB%A4%ED%86%A4?node-id=84-9077) | [운영자] 최종 판정 · 학습 데이터 | `/admin/inspections` | inspections | 운영자 판정 → 재학습 데이터 | P0 | 목록 + 상세 |

