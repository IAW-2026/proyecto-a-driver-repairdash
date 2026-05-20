"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function rechazarTrabajo(trabajoId: string): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const trabajo = await prisma.trabajo.findUnique({
    where: { id: trabajoId },
    select: { id: true, driverId: true },
  });

  // Si no existe en la BD simplemente no hacemos nada
  if (!trabajo) return;

  // El trabajo puede no tener driverId asignado (modelo nuevo) — igual lo borramos
  // Solo bloqueamos si tiene un driverId asignado que NO es el nuestro
  if (trabajo.driverId !== null) {
    const driver = await prisma.driver.findUnique({
      where: { clerkUserId: user.id },
      select: { id: true },
    });
    if (!driver || trabajo.driverId !== driver.id) return;
  }

  await prisma.$transaction([
    prisma.historialEstado.deleteMany({ where: { trabajoId } }),
    prisma.trabajo.delete({ where: { id: trabajoId } }),
  ]);
}
