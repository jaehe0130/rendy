// docs/api/openapi.yaml components.schemas 와 1:1. 계약이 바뀌면 /sync-contract
export type Category = "SEASONAL" | "LAUNDRY" | "KITCHEN" | "ELECTRONICS" | "HEATING";
export type PriceType = "STANDARD" | "VALUE"; // 일반형 / 실속형
export type DeviceSource = "NEW" | "BUYBACK" | "USED";
export type ProtectionPlan = "BASIC" | "SAFE" | "FULL";
export type InspectionStage = "OUTBOUND" | "RECEIVED" | "RETURN";
export type InspectionStatus =
  | "CAPTURING"
  | "ANALYZING"
  | "PRELIMINARY"
  | "NEEDS_REVIEW"
  | "FINAL"
  | "DISPUTED";
export type PhotoSide = "FRONT" | "LEFT" | "RIGHT" | "BACK" | "TOP" | "OPERATING";
export type DamageClass = "NONE" | "WEAR" | "FAULT" | "LOSS_OR_INTENTIONAL";
