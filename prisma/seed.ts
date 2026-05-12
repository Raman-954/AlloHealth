const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();
  const wh1 = await prisma.warehouse.create({
    data: { name: 'Main North Warehouse', location: 'New York' },
  });
  const wh2 = await prisma.warehouse.create({
    data: { name: 'South Distribution Center', location: 'Austin' },
  });
  const p1 = await prisma.product.create({
    data: { name: 'Mechanical Keyboard', description: 'RGB Backlit, Brown Switches' },
  });
  const p2 = await prisma.product.create({
    data: { name: 'Wireless Mouse', description: 'Ergonomic 16000 DPI' },
  });
  const p3 = await prisma.product.create({
    data: { name: 'Ultrawide Monitor', description: '34-inch Curved Display' },
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