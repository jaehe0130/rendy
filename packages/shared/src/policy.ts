import policy from "../policy/damage-policy.json";
import type { DamageClass, ProtectionPlan } from "./types/enums";

export const damagePolicy = policy;

/** 2cm 기준 근처라 운영자 확인이 필요한지 */
export function needsReview(lengthMm: number): boolean {
  return Math.abs(lengthMm - policy.wearThresholdMm) <= policy.reviewMarginMm;
}

/** 길이만으로 본 1차 분류 (AI 결과가 없을 때 mock 용) */
export function classifyByLength(lengthMm: number): DamageClass {
  return lengthMm <= policy.wearThresholdMm ? "WEAR" : "FAULT";
}

/** 고객 부담 계산 (8-4) */
export function customerCharge(
  cls: DamageClass,
  plan: ProtectionPlan,
  repairCostKrw: number,
  residualValueKrw: number,
  faultCoveredAlreadyUsed = false,
): number {
  if (cls === "NONE" || cls === "WEAR") return policy.wearChargeKrw;
  const p = policy.protectionPlans[plan];
  if (cls === "LOSS_OR_INTENTIONAL") return Math.round(residualValueKrw * p.lossRatio);
  const capped = Math.min(repairCostKrw, residualValueKrw);
  if (plan === "BASIC") return capped;
  if (plan === "SAFE") return Math.min(capped, policy.protectionPlans.SAFE.faultMaxKrw);
  return faultCoveredAlreadyUsed ? capped : 0;
}
