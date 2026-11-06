import type { DeviceSource, PriceType, ProtectionPlan } from "./enums";

export interface Device {
  id: string;
  code: string; // 예: D-0412
  source: DeviceSource;
  grade: "A" | "B";
  priceType: PriceType;
  conditionScore: number;
  acquiredAt: string;
  lastCleanedAt?: string;
  preexistingDamageCount: number;
}

export interface Rental {
  id: string;
  productId: string;
  device: Device;
  priceType: PriceType;
  protection: ProtectionPlan;
  startDate: string;
  endDate: string;
  status: "SCHEDULED" | "ACTIVE" | "RETURN_REQUESTED" | "RETURNED" | "CLOSED";
  receivedCheckDone: boolean;
}
