// 파손 판정 계산 — 기능명세서 v3.2 부록 C-7, C-12. 숫자는 damage-policy.json
import policy from "../policy/damage-policy.json";
import type { Confidence, DamageClass, ProtectionPlan } from "./types/enums";

export const damagePolicy = policy;

/** 2cm 기준 근처라 운영자 우선 확인이 필요한지 (명세서 외 제안값 reviewMarginMm) */
export function needsReview(lengthMm: number, confidence?: Confidence): boolean {
  if (confidence === "LOW") return true;
  return Math.abs(lengthMm - policy.wearThresholdMm) <= policy.reviewMarginMm;
}

/** 길이만으로 본 예비 분류 (C-7 2cm 규칙) */
export function classifyByLength(lengthMm: number): "WEAR" | "FAULT" {
  return lengthMm <= policy.wearThresholdMm ? "WEAR" : "FAULT";
}

/** AI 신뢰도 숫자 → 등급 (C-12) */
export function confidenceLevel(score: number): Confidence {
  if (score >= policy.confidence.highMin) return "HIGH";
  if (score >= policy.confidence.mediumMin) return "MEDIUM";
  return "LOW";
}

export interface NewFinding {
  lengthMm: number;
  /** 찍힘·깨짐이면 true (긁힘은 false) */
  dentOrBreak?: boolean;
}

/** 상태 점수 (C-12 ★): 출고 때 점수에서 새 흠집만큼 깎는다 */
export function conditionScore(before: number, findings: NewFinding[]): number {
  const c = policy.conditionScore;
  let score = before;
  for (const f of findings) {
    score -= (f.lengthMm / 10) * c.perCmOfNewDamage;
    if (f.lengthMm > policy.wearThresholdMm) score -= c.perFindingOver2cm;
    if (f.dentOrBreak) score -= c.perDentOrBreak;
  }
  return Math.max(c.min, Math.round(score));
}

export type PriceTypeSuggestion = "STANDARD" | "STANDARD_RECHECK" | "VALUE_OR_REPAIR";

/** 점수로 요금 유형 제안 (C-12) */
export function suggestPriceType(score: number): PriceTypeSuggestion {
  const c = policy.conditionScore;
  if (score >= c.suggestStandardMin) return "STANDARD";
  if (score >= c.suggestStandardRecheckMin) return "STANDARD_RECHECK";
  return "VALUE_OR_REPAIR";
}

/** 잔존가치 (C-7 ★) = 공식몰가 × max(0, 1 − 경과 개월 ÷ 예상 수명), 1,000원 반올림 */
export function residualValue(officialPriceKrw: number, monthsSinceRelease: number, lifespanMonths: number): number {
  const v = officialPriceKrw * Math.max(0, 1 - monthsSinceRelease / lifespanMonths);
  const r = policy.residualValue.roundToKrw;
  return Math.round(v / r) * r;
}

/**
 * 고객 부담 (C-7)
 * @param coverageUsed 이 렌탈에서 과실 파손 보장을 이미 썼는지 (보장은 렌탈당 1회, 2회째부터 기본과 같음)
 */
export function customerCharge(
  cls: DamageClass,
  plan: ProtectionPlan,
  repairCostKrw: number,
  residualValueKrw: number,
  coverageUsed = false,
): number {
  switch (cls) {
    case "NONE":
    case "NATURAL_FAILURE":
    case "WEAR":
    case "CONSUMABLE":
      return 0;
    case "INTENTIONAL":
      return Math.round(residualValueKrw * policy.intentionalRatio);
    case "LOSS":
      return Math.round(residualValueKrw * policy.protectionPlans[plan].lossRatio);
    case "FAULT": {
      const capped = Math.min(repairCostKrw, residualValueKrw);
      const effective: ProtectionPlan = coverageUsed && policy.coverageOncePerRental ? "BASIC" : plan;
      if (effective === "BASIC") return capped;
      if (effective === "SAFE") return Math.min(capped, policy.protectionPlans.SAFE.faultMaxKrw);
      return 0;
    }
  }
}

/** 과실 파손 후보일 때 단계 3개 비교 (DMG-04) */
export function chargeByPlan(repairCostKrw: number, residualValueKrw: number): Record<ProtectionPlan, number> {
  return {
    BASIC: customerCharge("FAULT", "BASIC", repairCostKrw, residualValueKrw),
    SAFE: customerCharge("FAULT", "SAFE", repairCostKrw, residualValueKrw),
    FULL: customerCharge("FAULT", "FULL", repairCostKrw, residualValueKrw),
  };
}
