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

    const formattedProducts = products.flatMap((product) =>
      product.inventories.map((inventory) => ({
        inventoryId: inventory.id,
        productName: product.name,
        warehouseName: inventory.warehouse.name,
        availableUnits: inventory.totalUnits - inventory.reservedUnits,
      }))
    );

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
