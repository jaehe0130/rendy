// 요금·기간·배송·매입 계산 — 기능명세서 v3.2 부록 C-1~C-6, C-9. 숫자는 rendy-policy.json
// 서버(apps/api)가 기준 계산을 하고, 화면(apps/web)은 미리보기용으로 같은 함수를 쓴다.
import policy from "../policy/rendy-policy.json";
import damage from "../policy/damage-policy.json";
import type { BuybackCondition, CouponKind, DeliveryMethod, PriceType, ProtectionPlan } from "./types/enums";

export const rendyPolicy = policy;

export type ProductKey = (typeof policy.products)[number]["key"];

export function productByKey(key: string) {
  const p = policy.products.find((x) => x.key === key);
  if (!p) throw new Error(`unknown product: ${key}`);
  return p;
}

export function hasValueTier(key: string): boolean {
  return productByKey(key).valueMonthlyKrw !== null;
}

/** 월 요금 (부록 B). 실속형이 없는 품목에 VALUE를 요청하면 에러 */
export function monthlyPrice(key: string, priceType: PriceType): number {
  const p = productByKey(key);
  if (priceType === "VALUE") {
    if (p.valueMonthlyKrw === null) throw new Error(`${p.name}은(는) 실속형이 없습니다`);
    return p.valueMonthlyKrw;
  }
  return p.standardMonthlyKrw;
}

/** 첫 달 요금 (C-3): 음식물 처리기 4개월 미만이면 20,000원 */
export function firstMonthPrice(key: string, priceType: PriceType, months: number): number {
  const p = productByKey(key) as (typeof policy.products)[number] & {
    shortTermFirstMonth?: { underMonths: number; firstMonthKrw: number };
  };
  if (p.shortTermFirstMonth && months < p.shortTermFirstMonth.underMonths) return p.shortTermFirstMonth.firstMonthKrw;
  return monthlyPrice(key, priceType);
}

export function protectionMonthly(plan: ProtectionPlan): number {
  return damage.protectionPlans[plan].monthlyKrw;
}

export interface CartLine {
  productKey: string;
  priceType: PriceType;
  months: number;
  protection: ProtectionPlan;
}

/** 배송비 (C-4, 주문 단위). 기준 = 월 요금 정가 합 */
export function deliveryFee(lines: CartLine[], method: DeliveryMethod, express = false): number {
  if (express) return policy.delivery.expressFeeKrw;
  if (method === "HUB") return policy.delivery.hubFeeKrw;
  const base = lines.reduce((s, l) => s + monthlyPrice(l.productKey, l.priceType), 0);
  return base >= policy.delivery.freeThresholdMonthlyKrw ? 0 : policy.delivery.doorFeeKrw;
}

/** 렌탈료 합계 (C-3) = 첫 달 + 월 요금 × (N − 1) */
export function rentalTotal(l: CartLine): number {
  return firstMonthPrice(l.productKey, l.priceType, l.months) + monthlyPrice(l.productKey, l.priceType) * (l.months - 1);
}

/** 신청 전 총비용 (RENT-13, C-3) = 렌탈료 합계 + 배송비 + 보장 요금 합계 (쿠폰 제외) */
export function totalCost(lines: CartLine[], method: DeliveryMethod, express = false): number {
  const rental = lines.reduce((s, l) => s + rentalTotal(l), 0);
  const protection = lines.reduce((s, l) => s + protectionMonthly(l.protection) * l.months, 0);
  return rental + protection + deliveryFee(lines, method, express);
}

/** AI 절약 리포트 숫자 (RENT-07) = 공식몰가 − 렌탈료 합계 */
export function savings(l: CartLine): number {
  return productByKey(l.productKey).officialPriceKrw - rentalTotal(l);
}

export interface CouponInput {
  kind: CouponKind;
  id: string;
}

/** 쿠폰 할인 (C-6). 적용 순서대로 종류별 1장. EXTENSION은 첫 결제에 쓰지 않음 */
export function couponDiscounts(lines: CartLine[], fee: number, coupons: CouponInput[], isFirstOrder: boolean) {
  const c = policy.coupons;
  const applied: { id: string; kind: CouponKind; amountKrw: number }[] = [];
  const used = new Set<CouponKind>();
  for (const kind of c.applyOrder as CouponKind[]) {
    const coupon = coupons.find((x) => x.kind === kind);
    if (!coupon || used.has(kind)) continue;
    let amount = 0;
    if (kind === "FIRST_MONTH_50" && isFirstOrder) {
      const maxFirst = Math.max(...lines.map((l) => firstMonthPrice(l.productKey, l.priceType, l.months)));
      amount = Math.min(Math.round(maxFirst * c.FIRST_MONTH_50.ratio), c.FIRST_MONTH_50.maxKrw);
    } else if (kind === "REFERRAL") {
      amount = c.REFERRAL.amountKrw;
    } else if (kind === "FREE_DELIVERY" && fee > 0) {
      amount = Math.min(fee, c.FREE_DELIVERY.maxKrw);
    }
    if (amount > 0) {
      applied.push({ id: coupon.id, kind, amountKrw: amount });
      used.add(kind);
    }
  }
  return applied;
}

/** 첫 결제 (C-3) = Σ첫 달 + Σ보장 월 + 배송비 − 쿠폰, 0원 미만 없음 */
export function firstPayment(lines: CartLine[], method: DeliveryMethod, coupons: CouponInput[] = [], isFirstOrder = false, express = false) {
  const fee = deliveryFee(lines, method, express);
  const firstMonths = lines.reduce((s, l) => s + firstMonthPrice(l.productKey, l.priceType, l.months), 0);
  const protection = lines.reduce((s, l) => s + protectionMonthly(l.protection), 0);
  const discounts = couponDiscounts(lines, fee, coupons, isFirstOrder);
  const discount = discounts.reduce((s, d) => s + d.amountKrw, 0);
  return {
    firstMonthsKrw: firstMonths,
    protectionKrw: protection,
    deliveryFeeKrw: fee,
    discounts,
    payTodayKrw: Math.max(0, firstMonths + protection + fee - discount),
    /** 2회차부터 매달 (가전마다 개월이 달라 회차별로는 렌탈마다 계산) */
    monthlyFromSecondKrw: lines.reduce((s, l) => s + monthlyPrice(l.productKey, l.priceType) + protectionMonthly(l.protection), 0),
  };
}

// ---------- 날짜 (C-2, C-5) — 'YYYY-MM-DD' 문자열, Asia/Seoul 기준 날짜로 취급 ----------

function parse(d: string): [number, number, number] {
  const [y, m, day] = d.split("-").map(Number);
  return [y, m, day];
}
function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
export function addDays(date: string, n: number): string {
  const [y, m, d] = parse(date);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return fmt(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}
/** N개월 뒤 같은 날 (없으면 그 달 말일) */
export function addMonthsClamp(date: string, n: number): string {
  const [y, m, d] = parse(date);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return fmt(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

/**
 * 종료일 (C-2). 명세 예: 11/03 시작 4개월 → 03/02, 01/31 시작 1개월 → 02/28.
 * N개월 뒤 같은 날이 있으면 그 하루 전, 없으면 그 달 말일.
 */
export function endDate(start: string, months: number): string {
  const [y, m, d] = parse(start);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const dim = daysInMonth(ny, nm);
  return d > dim ? fmt(ny, nm, dim) : addDays(fmt(ny, nm, d), -1);
}

/** 1개월 연장 새 종료일 (C-2) = (기존 종료일 + 1일) + M개월 − 1일 */
export function extendByMonths(end: string, months: number): string {
  return endDate(addDays(end, 1), months);
}

/** 1주 연장 (C-2, C-5) */
export function extendByWeeks(end: string, weeks: number): string {
  return addDays(end, 7 * weeks);
}

/** 1주 연장 금액 (C-5) = round(월 요금 ÷ 3, 100원) × W */
export function weekExtensionPrice(monthlyKrw: number, weeks: number): number {
  const w = policy.rental.weekExtension;
  return (Math.round(monthlyKrw / w.weekPriceDivisor / w.roundToKrw) * w.roundToKrw) * weeks;
}

export interface WeekExtensionCheck {
  today: string;
  end: string;
  usedWeeks: number;
  requestWeeks: number;
  overdue: boolean;
  nextAssigned: boolean;
}
export function canExtendByWeeks(x: WeekExtensionCheck): boolean {
  const w = policy.rental.weekExtension;
  return (
    !x.overdue &&
    !x.nextAssigned &&
    x.today >= addDays(x.end, -w.openDaysBeforeEnd) &&
    x.today < x.end &&
    x.usedWeeks + x.requestWeeks <= w.maxTotalWeeks
  );
}

// ---------- 매입 (C-9) — AI 사용 안 함 ----------

export interface BuybackInput {
  productKey: string;
  ageMonths: number;
  condition: BuybackCondition;
  rendyUser: boolean;
  seasonBonus?: boolean;
}

export function buybackQuote(x: BuybackInput) {
  const b = policy.buyback;
  const p = productByKey(x.productKey);
  const band = b.rateByAge.find((r) => x.ageMonths <= r.maxMonths);
  if (!band) return { eligible: false as const, reason: "구매 2년 초과" };
  if (x.condition === "VISIBLE_DAMAGE" && b.visibleDamageRequiresValueTier && p.valueMonthlyKrw === null) {
    return { eligible: false as const, reason: "실속형이 없는 품목의 눈에 띄는 흠집" };
  }
  const rate = band.rate + (x.rendyUser ? b.rendyUserBonusRate : 0);
  let v = p.officialPriceKrw * rate * b.conditionFactor[x.condition];
  if (x.seasonBonus) v *= policy.school.seasonBuybackBonusRatio;
  const round = (n: number) => Math.round(n / b.roundToKrw) * b.roundToKrw;
  const quote = round(v);
  return {
    eligible: true as const,
    quoteKrw: quote,
    minKrw: round(quote * b.rangeRatio[0]),
    maxKrw: round(quote * b.rangeRatio[1]),
    rate,
    validDays: b.quoteValidDays,
  };
}
