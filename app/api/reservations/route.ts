import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupExpiredReservations } from "@/lib/reservation-utils";

export async function POST(req: Request) {
  try {
    const { inventoryId, quantity } = await req.json();

    if (!inventoryId || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await cleanupExpiredReservations(inventoryId);

    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { id: inventoryId },
      });

      if (!inventory) throw new Error("NOT_FOUND");

      const available = inventory.totalUnits - inventory.reservedUnits;
      if (available < quantity) throw new Error("OUT_OF_STOCK");

      await tx.inventory.update({
        where: { id: inventoryId },
        data: { reservedUnits: { increment: quantity } },
      });

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      return await tx.reservation.create({
        data: {
          inventoryId,
          quantity,
          status: "PENDING",
          expiresAt,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("API_ERROR:", error.message);
    if (error.message === "OUT_OF_STOCK") {
      return NextResponse.json({ error: "No stock left (409)" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
