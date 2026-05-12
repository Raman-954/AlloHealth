import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const formatted = products.flatMap((product) =>
      product.inventories.map((inventory) => ({
        inventoryId: inventory.id,
        productName: product.name,
        sku: product.sku,
        warehouseName: inventory.warehouse.name,
        availableUnits: inventory.totalUnits - inventory.reservedUnits,
      }))
    );

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}
