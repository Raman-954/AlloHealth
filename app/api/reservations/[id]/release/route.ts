import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const resolvedParams = await params;
    const reservationId = resolvedParams.id;

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId }
      });

      if (!reservation || reservation.status !== "PENDING") {
        throw new Error("CANNOT_RELEASE");
      }
      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: { reservedUnits: { decrement: reservation.quantity } },
      });

      return await tx.reservation.update({
        where: { id: reservationId },
        data: { status: "RELEASED" },
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Release Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}