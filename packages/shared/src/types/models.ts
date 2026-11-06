// API 응답 타입 — docs/api/openapi.yaml 에서 자동 생성된 api.gen.ts 의 별칭.
// 계약을 바꾸면: pnpm --filter @rendy/shared gen:api  (직접 고치지 말 것)
import type { components, paths, operations } from "./api.gen";

export type { components, paths, operations };
type S = components["schemas"];

export type Member = S["Member"];
export type School = S["School"];
export type SchoolVerification = S["SchoolVerification"];
export type SchoolWelcome = S["SchoolWelcome"];
export type MemberCoupon = S["MemberCoupon"];
export type PaymentMethod = S["PaymentMethod"];

export type ProductSummary = S["ProductSummary"];
export type ProductDetail = S["ProductDetail"];
export type PriceOption = S["PriceOption"];
export type ProductAiSummary = S["ProductAiSummary"];
export type CompareTable = S["CompareTable"];
export type DeviceBrief = S["DeviceBrief"];
export type DeviceHistory = S["DeviceHistory"];
export type Guide = S["Guide"];
export type WaitlistEntry = S["WaitlistEntry"];

export type DiagnosisAnswers = S["DiagnosisAnswers"];
export type Diagnosis = S["Diagnosis"];
export type Consultation = S["Consultation"];

export type CartItem = S["CartItem"];
export type Quote = S["Quote"];
export type Order = S["Order"];
export type ExtensionOptions = S["ExtensionOptions"];

export type Rental = S["Rental"];
export type ReceivedCheckResult = S["ReceivedCheckResult"];
export type PhotoInput = S["PhotoInput"];
export type Photo = S["Photo"];
export type FindingInput = S["FindingInput"];
export type Finding = S["Finding"];
export type Judgement = S["Judgement"];
export type OutboundInspection = S["OutboundInspection"];
export type AiMetrics = S["AiMetrics"];

export type Buyback = S["Buyback"];
export type AdminDevice = S["AdminDevice"];
export type DeliveryTask = S["DeliveryTask"];
export type Dashboard = S["Dashboard"];
export type ApiError = S["Error"];
