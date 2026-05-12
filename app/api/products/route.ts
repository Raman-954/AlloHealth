import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const inventories = await prisma.inventory.findMany({
    include: {
      product: true,
      warehouse: true,
    },
  });

  const products = inventories.map((inventory) => ({
    inventoryId: inventory.id,
    productName: inventory.product.name,
    warehouseName: inventory.warehouse.name,
    availableStock: inventory.totalUnits - inventory.reservedUnits,
  }));

  return NextResponse.json(products);
}
