import { prisma } from "./prisma";

export async function cleanupExpiredReservations(inventoryId: string) {
  const now = new Date();
  
  const expired = await prisma.reservation.findMany({
    where: {
      inventoryId,
      status: "PENDING",
      expiresAt: { lt: now },
    },
  });

  if (expired.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const res of expired) {
      await tx.inventory.update({
        where: { id: inventoryId },
        data: { reservedUnits: { decrement: res.quantity } },
      });
      await tx.reservation.update({
        where: { id: res.id },
        data: { status: "RELEASED" },
      });
    }
  });
}