import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const formattedProducts = products.map((item) => ({
      inventoryId: item.id,
      productName: item.product.name,
      warehouseName: item.warehouse.name,
      availableStock: item.totalUnits - item.reservedUnits,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
