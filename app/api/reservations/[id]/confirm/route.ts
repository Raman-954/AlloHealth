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
        where: { id: reservationId },
        include: { inventory: true },
      });

      if (!reservation) throw new Error("NOT_FOUND");
      if (reservation.status === "CONFIRMED") return reservation;
      if (reservation.status === "RELEASED") throw new Error("ALREADY_RELEASED");

      if (reservation.expiresAt < new Date()) {
        await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: { reservedUnits: { decrement: reservation.quantity } },
        });
        await tx.reservation.update({
          where: { id: reservationId },
          data: { status: "RELEASED" },
        });
        throw new Error("EXPIRED");
      }

      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: {
          totalUnits: { decrement: reservation.quantity },
          reservedUnits: { decrement: reservation.quantity },
        },
      });

      return await tx.reservation.update({
        where: { id: reservationId },
        data: { status: "CONFIRMED" },
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Confirmation Error:", error);
    const status = error.message === "EXPIRED" ? 410 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}