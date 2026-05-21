"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/config/get-base-url";

export async function rechazarTrabajo(
  trabajoId: string,
): Promise<void> {
  const user =
    await currentUser();

  if (!user) return;

  const [
    driver,
    trabajo,
  ] = await Promise.all([
    prisma.driver.findUnique({
      where: {
        clerkUserId:
          user.id,
      },
      select: {
        id: true,
      },
    }),
    prisma.trabajo.findUnique({
      where: {
        id: trabajoId,
      },
      select: {
        id: true,
        driverId: true,
      },
    }),
  ]);

  if (
    !driver ||
    !trabajo
  ) {
    return;
  }

  if (
    trabajo.driverId !== null &&
    trabajo.driverId !== driver.id
  ) {
    return;
  }

  await prisma.trabajoRechazado.upsert({
    where: {
      driverId_trabajoId: {
        driverId:
          driver.id,
        trabajoId,
      },
    },
    update: {},
    create: {
      driverId:
        driver.id,
      trabajoId,
    },
  });

  revalidatePath("/");
}

export async function aceptarTrabajo(trabajoId: string): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true, status: true },
  });

  if (!driver) throw new Error("Driver no encontrado");
  if (driver.status === "EN_TRABAJO") throw new Error("Ya tienes un trabajo activo");

  await prisma.$transaction(async (tx) => {
    const trabajo = await tx.trabajo.findUnique({
      where: { id: trabajoId },
      select: { id: true, estado: true, driverId: true },
    });

    if (!trabajo) throw new Error("Trabajo no encontrado");
    if (trabajo.estado !== "PENDIENTE") throw new Error("El trabajo ya no está disponible");
    if (trabajo.driverId !== null) throw new Error("El trabajo ya fue tomado");

    await tx.trabajo.update({
      where: { id: trabajoId },
      data: { driverId: driver.id, estado: "ACEPTADO" },
    });

    await tx.driver.update({
      where: { id: driver.id },
      data: { status: "EN_TRABAJO" },
    });

    await tx.historialEstado.create({
      data: { trabajoId, estadoAnterior: "PENDIENTE", estadoNuevo: "ACEPTADO" },
    });
  });

  // 🔔 Notificar a RiderApp usando getBaseUrl
  const baseUrl = getBaseUrl();
  await fetch(`${baseUrl}/api/trabajos/state`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.RIDER_APP_API_KEY!,
    },
    body: JSON.stringify({
      id_trabajo: trabajoId,
      estado: "aceptado",
    }),
  });

  revalidatePath("/");
  revalidatePath("/trabajos/activo");
}
