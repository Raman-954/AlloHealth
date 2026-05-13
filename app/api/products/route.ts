import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      inventories: {
        include: { warehouse: true }
      }
    }
  });
  const inventoryList = products.flatMap(p => 
    p.inventories.map(inv => ({
      inventoryId: inv.id,
      productName: p.name,
      warehouseName: inv.warehouse.name,
      availableStock: inv.totalUnits - inv.reservedUnits,
    }))
  );
  return NextResponse.json(inventoryList);
}
