"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canTransition } from "@/lib/state-machine/trabajo.states";
import { TrabajoEstado } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  createFeedbackReport,
  createFeedbackTrabajo,
  requestFeedbackReview,
} from "@/lib/services/external/feedback.client";
import {
  notifyRiderTrabajoState,
} from "@/lib/services/external/rider.client";

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
  revalidatePath("/admin/servicios");
}

export async function aceptarTrabajo(trabajoId: string): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true, clerkUserId: true, status: true },
  });

  if (!driver) throw new Error("Driver no encontrado");
  if (driver.status === "EN_TRABAJO") throw new Error("Ya tienes un trabajo activo");

  const acceptedTrabajo = await prisma.$transaction(async (tx) => {
    const trabajo = await tx.trabajo.findUnique({
      where: { id: trabajoId },
      select: {
        id: true,
        estado: true,
        driverId: true,
        riderId: true,
        tipoServicio: {
          select: {
            nombre: true,
          },
        },
      },
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

    return trabajo;
  });

  await notifyRiderTrabajoState({
    trabajoId,
    estado: TrabajoEstado.ACEPTADO,
    driverId: driver.clerkUserId,
  });

  await createFeedbackTrabajo({
    idTrabajo: acceptedTrabajo.id,
    idCliente: acceptedTrabajo.riderId,
    idTrabajador: driver.clerkUserId,
    tipoDeTrabajo: acceptedTrabajo.tipoServicio.nombre,
  });

  revalidatePath("/");
  revalidatePath("/trabajos/activo");
  revalidatePath("/admin/servicios");
}

export async function avanzarTrabajo(trabajoId: string, nuevoEstado: TrabajoEstado): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: {
      id: true,
      clerkUserId: true,
    },
  });

  if (!driver) throw new Error("Driver no encontrado");

  let wasCancelled = false;
  let didTransition = false;

  await prisma.$transaction(async (tx) => {
    const trabajo = await tx.trabajo.findUnique({
      where: { id: trabajoId },
      select: {
        id: true,
        estado: true,
        driverId: true,
      },
    });

    if (!trabajo) throw new Error("Trabajo no encontrado");

    if (trabajo.driverId !== driver.id) {
      throw new Error("No autorizado");
    }

    if (trabajo.estado === TrabajoEstado.CANCELADO) {
      wasCancelled = true;
      return;
    }

    if (trabajo.estado === nuevoEstado) {
      return;
    }

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

    didTransition = true;
  });

  if (wasCancelled) {
    revalidatePath("/");
    revalidatePath("/trabajos/activo");
    redirect("/trabajos/activo");
  }

  if (didTransition) {
    await notifyRiderTrabajoState({
      trabajoId,
      estado: nuevoEstado,
      driverId: driver.clerkUserId,
    });
  }

  revalidatePath("/");
  revalidatePath("/trabajos/activo");
  revalidatePath("/admin/servicios");

  if (nuevoEstado === "FINALIZADO") {
    redirect("/"); //TODO redireccionar a una página de feedback 
  }

  redirect("/trabajos/activo");
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
        clerkUserId: true,
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

  await createFeedbackReport({
    idTrabajo: trabajo.id,
    idReportante: driver.clerkUserId,
    idReportado: trabajo.riderId,
  });

  await prisma.$transaction(async (tx) => {
    await tx.trabajo.update({
      where: {
        id: trabajo.id,
      },
      data: {
        estado:
          TrabajoEstado.CANCELADO,
      },
    });

    await tx.historialEstado.create({
      data: {
        trabajoId:
          trabajo.id,
        estadoAnterior:
          trabajo.estado,
        estadoNuevo:
          TrabajoEstado.CANCELADO,
        motivo:
          "Cancelacion por reporte iniciado por el driver",
      },
    });

    await tx.driver.update({
      where: {
        id: driver.id,
      },
      data: {
        status: "ONLINE",
      },
    });
  });

  await notifyRiderTrabajoState({
    trabajoId:
      trabajo.id,
    estado:
      TrabajoEstado.CANCELADO,
    driverId:
      driver.clerkUserId,
  });

  revalidatePath("/");
  revalidatePath("/trabajos/activo");
  revalidatePath("/admin/servicios");
  redirect("https://proyecto-a-feedback-repairdash.vercel.app/reportes");
}

export async function finalizarTrabajo(
  trabajoId: string,
): Promise<void> {
  const user = await currentUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true },
  });

  if (!driver) {
    throw new Error("Driver no encontrado");
  }

  const trabajo = await prisma.trabajo.findUnique({
    where: { id: trabajoId },
    select: {
      id: true,
      riderId: true,
      driverId: true,
      estado: true,
      tipoServicio: {
        select: { nombre: true },
      },
    },
  });

  if (!trabajo) {
    throw new Error("Trabajo no encontrado");
  }

  if (trabajo.driverId !== driver.id) {
    throw new Error("No autorizado");
  }

  if (trabajo.estado !== "EN_SERVICIO") {
    throw new Error("El trabajo no está en servicio");
  }

  await prisma.$transaction(async (tx) => {
    await tx.trabajo.update({
      where: { id: trabajoId },
      data: { estado: "FINALIZADO" },
    });

    await tx.historialEstado.create({
      data: {
        trabajoId,
        estadoAnterior: "EN_SERVICIO",
        estadoNuevo: "FINALIZADO",
      },
    });

    await tx.driver.update({
      where: { id: driver.id },
      data: { status: "ONLINE" },
    });
  });

  await notifyRiderTrabajoState({
    trabajoId,
    estado: TrabajoEstado.FINALIZADO,
  });

  await requestFeedbackReview(trabajoId);

  revalidatePath("/");
  revalidatePath("/trabajos/activo");
  revalidatePath("/admin/servicios");

  redirect("https://proyecto-a-feedback-repairdash.vercel.app/reviews");
}
