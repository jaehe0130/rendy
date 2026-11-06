// docs/api/openapi.yaml components.schemas · database/prisma/schema.prisma 와 1:1.
// 상태값은 기능명세서 v3.2 부록 D. 계약이 바뀌면 /sync-contract

export type Category = "KITCHEN" | "LAUNDRY" | "SEASONAL" | "AIR"; // 주방 · 세탁·건조 · 계절 · 가습·공기
export type PriceType = "STANDARD" | "VALUE"; // 일반형 · 실속형
export type DeviceSource = "NEW" | "BUYBACK"; // 새 제품 · 중고 매입
export type Grade = "A" | "B";
export type ProtectionPlan = "BASIC" | "SAFE" | "FULL"; // 기본 · 안심 · 완전 안심
export type DeliveryMethod = "DOOR" | "HUB"; // 문 앞 지정일 · 거점 수령

/** D-1 주문 */
export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "CANCELED" | "EXPIRED";

/** D-2 렌탈 (가전 1대) */
export type RentalStatus =
  | "PREPARING" // 배송 준비
  | "SHIPPING" // 배송 중(문 앞)
  | "AT_HUB" // 거점 도착
  | "IN_USE" // 사용 중
  | "RETURN_REQUESTED" // 반납 신청
  | "PICKUP_SCHEDULED" // 회수 예정
  | "PICKED_UP" // 회수 완료
  | "JUDGING" // 판정 중
  | "JUDGED" // 판정 확정
  | "ENDED" // 종료
  | "CANCELED" // 취소됨
  | "SWAPPED"; // 교체됨

/** D-3 기기 */
export type DeviceStatus =
  | "INTAKE"
  | "MAINTENANCE"
  | "AVAILABLE"
  | "RESERVED"
  | "RENTED"
  | "RETRIEVING"
  | "INSPECTING"
  | "SOLD"
  | "DISPOSED";

/** D-4 매입 */
export type BuybackStatus =
  | "QUOTED"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "INSPECTING"
  | "AWAITING_CONSENT"
  | "PAID"
  | "REJECTED"
  | "QUOTE_EXPIRED"
  | "CANCELED";

/** D-6 파손 판정: AI 예비 → 운영자 최종(알림, 이의 48h) → 이의 중 → 확정 → 청구 */
export type JudgementStatus =
  | "PRELIMINARY" // AI 예비 판정
  | "FINAL_NOTIFIED" // 운영자 최종 판정 알림, 이의 기간
  | "DISPUTED" // 이의 중
  | "CONFIRMED" // 확정 (부담 0원이면 여기서 끝)
  | "CHARGED"; // 청구 완료

/** D-7 대기 명단 */
export type WaitlistStatus = "WAITING" | "NOTIFIED" | "PAID" | "TIMED_OUT" | "CANCELED";

/** D-8 정기 결제 회차 */
export type PaymentStatus = "SCHEDULED" | "PAID" | "FAILED_1" | "FAILED_2" | "FAILED_3_OVERDUE";
export type PaymentKind = "FIRST" | "INSTALLMENT" | "WEEK_EXTENSION" | "DELIVERY_FEE" | "DAMAGE_CHARGE";

/** D-9 회원 쿠폰 */
export type CouponKind = "FIRST_MONTH_50" | "REFERRAL" | "FREE_DELIVERY" | "EXTENSION";
export type MemberCouponStatus = "ISSUED" | "USED" | "EXPIRED";

/** D-10 학교 인증 */
export type SchoolVerificationMethod = "EMAIL" | "STUDENT_CARD";
export type SchoolVerificationStatus = "CODE_SENT" | "VERIFIED" | "CARD_PENDING" | "REJECTED";

/** D-12 가이드 글 */
export type GuideStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "UNPUBLISHED";

/** 사진 */
export type PhotoPurpose = "OUTBOUND" | "RECEIVED" | "RETURN" | "BUYBACK";
export type PhotoSide = "FRONT" | "LEFT" | "RIGHT" | "BACK" | "TOP" | "OPERATING";

/** C-7 파손·고장 원인 */
export type DamageClass =
  | "NONE" // 변화 없음
  | "NATURAL_FAILURE" // 자연 고장
  | "WEAR" // 생활 마모
  | "CONSUMABLE" // 소모품
  | "FAULT" // 과실 파손
  | "LOSS" // 분실·도난
  | "INTENTIONAL"; // 고의 훼손

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

/** 매입 상태(판매자 선택) */
export type BuybackCondition = "LIKE_NEW" | "WEAR" | "VISIBLE_DAMAGE";

export type Agreement = "TERMS" | "PRIVACY" | "DAMAGE_POLICY" | "MARKETING";
