// pnpm db:seed — apps/api 의 prisma 설정에서 실행됨
// TODO(데이터): products.json, demo-scenario.json 을 읽어 upsert
import { PrismaClient } from "@prisma/client";
import products from "./products.json";
import scenario from "./demo-scenario.json";

const prisma = new PrismaClient();

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.name },
      update: {},
      create: {
        id: p.name,
        name: p.name,
        category: p.category as any,
        newPriceKrw: p.newPriceKrw,
        prices: {
          create: Object.entries(p.prices).map(([priceType, monthlyKrw]) => ({
            priceType: priceType as any,
            monthlyKrw: monthlyKrw as number,
          })),
        },
      },
    });
  }
  console.log(`seeded ${products.length} products; demo devices: ${scenario.devices.length} (TODO)`);
}

main().finally(() => prisma.$disconnect());
