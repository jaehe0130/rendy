import type { DamageClass, InspectionStage, InspectionStatus, PhotoSide } from "./enums";

export interface InspectionPhoto {
  id: string;
  side: PhotoSide;
  url: string;
  retakeHint?: string | null;
}

export interface DamageFinding {
  id: string;
  side: PhotoSide;
  /** [x, y, w, h], 0~1 정규화 */
  bbox: [number, number, number, number];
  lengthMm: number;
  preexisting: boolean;
  aiClass: DamageClass;
  aiConfidence: number;
  needsReview: boolean;
  finalClass?: DamageClass | null;
  overrideReason?: string | null;
}

export interface Inspection {
  id: string;
  stage: InspectionStage;
  status: InspectionStatus;
  deviceId: string;
  rentalId?: string | null;
  photos: InspectionPhoto[];
  baselinePhotos: InspectionPhoto[];
  findings: DamageFinding[];
  conditionScoreBefore?: number;
  conditionScoreAfter?: number;
  preliminaryCharge?: number;
  finalCharge?: number | null;
  disputeDeadline?: string | null;
}
