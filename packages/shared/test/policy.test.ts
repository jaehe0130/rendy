// 기능명세서 v3.2 부록 예시로 계산 함수 검증. 실행: pnpm --filter @rendy/shared test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buybackQuote,
  canExtendByWeeks,
  chargeByPlan,
  conditionScore,
  customerCharge,
  deliveryFee,
  endDate,
  extendByMonths,
  firstMonthPrice,
  firstPayment,
  needsReview,
  residualValue,
  totalCost,
  weekExtensionPrice,
  type CartLine,
} from "../src/index";

test("C-2 종료일 예시", () => {
  assert.equal(endDate("2026-11-03", 4), "2027-03-02");
  assert.equal(endDate("2027-01-31", 1), "2027-02-28");
  assert.equal(extendByMonths("2027-03-02", 1), "2027-04-02");
});

test("C-3 음식물 처리기 4개월 미만 첫 달 20,000", () => {
  assert.equal(firstMonthPrice("food-waste-disposer", "STANDARD", 3), 20000);
  assert.equal(firstMonthPrice("food-waste-disposer", "STANDARD", 4), 15000);
});

test("C-4 배송비: 월 요금 합 30,000 이상 무료", () => {
  const one: CartLine[] = [{ productKey: "dehumidifier", priceType: "STANDARD", months: 4, protection: "BASIC" }];
  assert.equal(deliveryFee(one, "DOOR"), 10000);
  assert.equal(deliveryFee(one, "HUB"), 0);
  const two: CartLine[] = [...one, { productKey: "humidifier", priceType: "STANDARD", months: 4, protection: "BASIC" }];
  assert.equal(deliveryFee(two, "DOOR"), 0);
  assert.equal(deliveryFee(two, "DOOR", true), 10000);
});

test("RENT-13 총비용 = 렌탈료 + 배송비 + 보장 (와이어프레임 2-3 예시)", () => {
  const l: CartLine = { productKey: "dehumidifier", priceType: "STANDARD", months: 4, protection: "FULL" };
  // 60,000 + 10,000 + 8,000
  assert.equal(totalCost([l], "DOOR"), 78000);
});

test("C-6 첫 달 50% (최대 1만) + 배송비 무료", () => {
  const l: CartLine = { productKey: "dehumidifier", priceType: "STANDARD", months: 4, protection: "BASIC" };
  const r = firstPayment([l], "DOOR", [
    { kind: "FIRST_MONTH_50", id: "c1" },
    { kind: "FREE_DELIVERY", id: "c2" },
  ], true);
  assert.equal(r.payTodayKrw, 15000 - 7500 + 10000 - 10000);
});

test("C-5 1주 연장 = round(월 ÷ 3, 100) × W", () => {
  assert.equal(weekExtensionPrice(15000, 1), 5000);
  assert.equal(weekExtensionPrice(20000, 2), 13400);
  assert.equal(
    canExtendByWeeks({ today: "2026-11-10", end: "2026-11-24", usedWeeks: 0, requestWeeks: 1, overdue: false, nextAssigned: false }),
    true,
  );
  assert.equal(
    canExtendByWeeks({ today: "2026-11-09", end: "2026-11-24", usedWeeks: 0, requestWeeks: 1, overdue: false, nextAssigned: false }),
    false,
  );
});

test("C-9 매입 예시: 제습기 1년 이하 거의 새것", () => {
  const q = buybackQuote({ productKey: "dehumidifier", ageMonths: 10, condition: "LIKE_NEW", rendyUser: false });
  assert.ok(q.eligible);
  if (q.eligible) {
    assert.equal(q.quoteKrw, 113000);
    assert.equal(q.minKrw, 102000);
    assert.equal(q.maxKrw, 124000);
  }
  const r = buybackQuote({ productKey: "dehumidifier", ageMonths: 10, condition: "LIKE_NEW", rendyUser: true });
  assert.ok(r.eligible && r.quoteKrw === 132000);
  assert.equal(buybackQuote({ productKey: "humidifier", ageMonths: 6, condition: "VISIBLE_DAMAGE", rendyUser: false }).eligible, false);
  assert.equal(buybackQuote({ productKey: "dehumidifier", ageMonths: 30, condition: "LIKE_NEW", rendyUser: false }).eligible, false);
});

test("C-7 고객 부담 (8-4 예시: 수리비 48,000)", () => {
  assert.deepEqual(chargeByPlan(48000, 301000), { BASIC: 48000, SAFE: 10000, FULL: 0 });
  assert.equal(customerCharge("FAULT", "FULL", 48000, 301000, true), 48000); // 보장 2회째
  assert.equal(customerCharge("LOSS", "FULL", 0, 301000), 150500);
  assert.equal(customerCharge("INTENTIONAL", "FULL", 0, 301000), 301000);
  assert.equal(customerCharge("WEAR", "BASIC", 0, 301000), 0);
  assert.equal(residualValue(377000, 12, 60), 302000);
});

test("C-12 상태 점수", () => {
  assert.equal(conditionScore(92, [{ lengthMm: 16 }]), 82);
  assert.equal(conditionScore(92, [{ lengthMm: 42, dentOrBreak: true }]), 42);
  assert.equal(needsReview(16), true);
  assert.equal(needsReview(42), false);
});
