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
        include: { inventory: true },
      });

      if (!reservation) throw new Error("NOT_FOUND");
      if (reservation.status === "CONFIRMED") return reservation;
      if (reservation.status === "RELEASED") throw new Error("ALREADY_RELEASED");

      const now = new Date();
      if (reservation.expiresAt < now) {
        await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: { reservedUnits: { decrement: reservation.quantity } },
        });
        await tx.reservation.update({
          where: { id: id },
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
        where: { id: id },
        data: { status: "CONFIRMED" },
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("CONFIRM_ERROR:", error.message);
    const status = error.message === "EXPIRED" ? 410 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
