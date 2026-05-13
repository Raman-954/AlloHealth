import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: id },
      });

      if (!reservation || reservation.status !== "PENDING") {
        throw new Error("CANNOT_RELEASE");
      }

      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: { reservedUnits: { decrement: reservation.quantity } },
      });

      return await tx.reservation.update({
        where: { id: id },
        data: { status: "RELEASED" },
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("RELEASE_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
