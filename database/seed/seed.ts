// pnpm db:seed — 품목(요금은 rendy-policy.json) + 학교 7곳 + 데모 기기 · 회원
// TODO(데이터): 데모 렌탈 · 출고 사진 · 기존 흠집(Finding) 생성
import { PrismaClient } from "@prisma/client";
import policy from "../../packages/shared/policy/rendy-policy.json";
import seed from "./products.json";
import scenario from "./demo-scenario.json";

const prisma = new PrismaClient();

const ABBR: Record<string, string> = {
  성신여대: "SS", 고려대: "KU", 국민대: "KM", 한성대: "HS", 동덕여대: "DD", 서경대: "SK", KC대: "KC",
};

async function main() {
  for (const p of policy.products) {
    const extra = seed.products.find((s) => s.key === p.key)!;
    const data = {
      name: p.name,
      category: p.category as any,
      officialPriceKrw: p.officialPriceKrw,
      standardMonthlyKrw: p.standardMonthlyKrw,
      valueMonthlyKrw: p.valueMonthlyKrw,
      lifespanMonths: p.lifespanMonths,
      aliases: extra.aliases,
      consumables: extra.consumables,
      specs: extra.specs,
      imageUrl: extra.imageUrl,
    };
    await prisma.product.upsert({ where: { key: p.key }, update: data, create: { key: p.key, ...data } });
  }

  for (const [name, domain] of Object.entries(policy.school.domains)) {
    await prisma.school.upsert({
      where: { name },
      update: { emailDomain: domain },
      create: { name, emailDomain: domain, abbreviation: ABBR[name] },
    });
  }

  for (const u of scenario.users) {
    await prisma.member.upsert({
      where: { phone: u.phone },
      update: {},
      create: { name: u.name, phone: u.phone, birth6: "000101", isAdmin: !!(u as any).isAdmin },
    });
  }

  for (const d of scenario.devices) {
    await prisma.device.upsert({
      where: { code: d.code },
      update: {},
      create: {
        code: d.code,
        productKey: d.productKey,
        source: d.source as any,
        grade: d.grade as any,
        priceType: d.priceType as any,
        conditionScore: d.conditionScore,
        releasedMonth: new Date("2024-03-01"),
        acquiredMonth: new Date("2025-04-01"),
        status: "AVAILABLE",
      },
    });
  }
  console.log(`seeded ${policy.products.length} products, ${Object.keys(policy.school.domains).length} schools, ${scenario.devices.length} devices`);
}

main().finally(() => prisma.$disconnect());
