const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();
  const wh1 = await prisma.warehouse.create({
    data: { name: 'NJ Logistics Center', location: 'New Jersey' },
  });
  const wh2 = await prisma.warehouse.create({
    data: { name: 'California Distribution Hub', location: 'San Jose' },
  });
  const p1 = await prisma.product.create({
    data: { name: 'Allo Rest+ Sleep Monitor', description: 'Medical-grade wearable for deep sleep analysis.' },
  });
  const p2 = await prisma.product.create({
    data: { name: 'Vitality Essential 30-Day Pack', description: 'Personalized daily multivitamin subscription.' },
  });
  const p3 = await prisma.product.create({
    data: { name: 'SilkProtein Hydrolyzed Isolate', description: 'Premium plant-based protein, Limited Batch.' },
  });
  await prisma.inventory.createMany({
    data: [
      { productId: p1.id, warehouseId: wh1.id, totalUnits: 10, reservedUnits: 0 },
      { productId: p1.id, warehouseId: wh2.id, totalUnits: 5, reservedUnits: 0 },
      { productId: p2.id, warehouseId: wh1.id, totalUnits: 20, reservedUnits: 0 },
      { productId: p3.id, warehouseId: wh2.id, totalUnits: 2, reservedUnits: 0 },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
