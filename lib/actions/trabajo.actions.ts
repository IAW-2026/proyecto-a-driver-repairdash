"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/config/get-base-url";
import { canTransition } from "@/lib/state-machine/trabajo.states";
import { TrabajoEstado } from "@prisma/client";
import { redirect } from "next/navigation";

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

export async function avanzarTrabajo(trabajoId: string, nuevoEstado: TrabajoEstado): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true },
  });

  if (!driver) throw new Error("Driver no encontrado");

  await prisma.$transaction(async (tx) => {
    const trabajo = await tx.trabajo.findUnique({
      where: { id: trabajoId },
      select: { id: true, estado: true },
    });

    if (!trabajo) throw new Error("Trabajo no encontrado");
    if (!canTransition(trabajo.estado, nuevoEstado)) {
      throw new Error(`Transición inválida: ${trabajo.estado} → ${nuevoEstado}`);
    }

    await tx.trabajo.update({
      where: { id: trabajoId },
      data: { estado: nuevoEstado },
    });

    await tx.historialEstado.create({
      data: {
        trabajoId,
        estadoAnterior: trabajo.estado,
        estadoNuevo: nuevoEstado,
      },
    });

    if (nuevoEstado === "FINALIZADO") {
      await tx.driver.update({
        where: { id: driver.id },
        data: { status: "ONLINE" },
      });
    }
  });

  // 🔔 Notificar a RiderApp
  const baseUrl = getBaseUrl();
  await fetch(`${baseUrl}/api/trabajos/state`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.RIDER_APP_API_KEY!,
    },
    body: JSON.stringify({
      id_trabajo: trabajoId,
      estado: nuevoEstado.toLowerCase(),
    }),
  });

  revalidatePath("/");
  revalidatePath("/trabajos/activo");
}

export async function comenzarReporte(
  trabajoId: string,
): Promise<void> {
  const user =
    await currentUser();

  if (!user) {
    throw new Error(
      "No autenticado",
    );
  }

  const driver =
    await prisma.driver.findUnique({
      where: {
        clerkUserId:
          user.id,
      },
      select: {
        id: true,
      },
    });

  if (!driver) {
    throw new Error(
      "Driver no encontrado",
    );
  }

  const trabajo =
    await prisma.trabajo.findUnique({
      where: {
        id: trabajoId,
      },
      select: {
        id: true,
        riderId: true,
        driverId: true,
        estado: true,
      },
    });

  if (!trabajo) {
    throw new Error(
      "Trabajo no encontrado",
    );
  }

  if (
    trabajo.driverId !==
    driver.id
  ) {
    throw new Error(
      "No autorizado",
    );
  }

  if (
    trabajo.estado !==
    "EN_SERVICIO"
  ) {
    throw new Error(
      "El trabajo no está en servicio",
    );
  }

  // TODO: reemplazar por URL real al integrar Feedback App
  const feedbackBaseUrl =
    process.env
      .FEEDBACK_APP_URL ??
    "http://localhost:3002";

  const response =
    await fetch(
      `${feedbackBaseUrl}/api/reports`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          idTrabajo:
            trabajo.id,
          idReportante:
            driver.id,
          idReportado:
            trabajo.riderId,
        }),
      },
    );

  if (!response.ok) {
    throw new Error(
      "No se pudo crear el reporte",
    );
  }

  const data =
    await response.json();

  redirect(
    `${feedbackBaseUrl}/reportes/${data.idReporte}`,
  );
}