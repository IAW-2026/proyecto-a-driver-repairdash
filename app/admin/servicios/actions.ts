"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";
import {
  Prisma,
  TrabajoEstado,
} from "@prisma/client";

function readServiceTypeForm(formData: FormData) {
  const nombre = formData.get("nombre")?.toString().trim();
  const descripcion = formData.get("descripcion")?.toString().trim();
  const precioBase = Number(formData.get("precioBase"));

  if (!nombre || !descripcion || Number.isNaN(precioBase) || precioBase <= 0) {
    throw new Error("Ingresa un nombre, una descripcion y un precio base valido.");
  }

  return {
    nombre,
    descripcion,
    precioBase,
  };
}

const serviceSelect = {
  id: true,
  nombre: true,
  descripcion: true,
  precioBase: true,
  creadoEn: true,
  actualizadoEn: true,
  driverServicios: {
    select: {
      id: true,
      driver: {
        select: {
          clerkUserId: true,
        },
      },
    },
  },
  trabajos: {
    where: {
      estado: {
        notIn: [
          TrabajoEstado.FINALIZADO,
          TrabajoEstado.CANCELADO,
        ],
      },
    },
    select: {
      id: true,
      driver: {
        select: {
          clerkUserId: true,
        },
      },
    },
  },
} satisfies Prisma.TipoServicioSelect;

function serializeServiceType(service: {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: { toNumber: () => number };
  creadoEn: Date;
  actualizadoEn: Date;
  driverServicios: { id: string; driver: { clerkUserId: string } }[];
  trabajos: { id: string; driver: { clerkUserId: string } | null }[];
}): AdminServiceType {
  return {
    id: service.id,
    nombre: service.nombre,
    descripcion: service.descripcion,
    precioBase: service.precioBase.toNumber(),
    creadoEn: service.creadoEn.toISOString(),
    actualizadoEn: service.actualizadoEn.toISOString(),
    driverServicios: service.driverServicios.map((driverService) => ({
      id: driverService.id,
      driverId: driverService.driver.clerkUserId,
    })),
    trabajos: service.trabajos.map((trabajo) => ({
      id: trabajo.id,
      driverId: trabajo.driver?.clerkUserId ?? null,
    })),
  };
}

export async function createServiceType(formData: FormData) {
  await requireAdmin();

  const service = await prisma.tipoServicio.create({
    data: readServiceTypeForm(formData),
    select: serviceSelect,
  });

  revalidatePath("/admin/servicios");

  return serializeServiceType(service);
}

export async function deleteServiceType(id: string) {
  await requireAdmin();

  await prisma.tipoServicio.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/servicios");

  return {
    id,
  };
}

export async function updateServiceType(id: string, formData: FormData) {
  await requireAdmin();

  const service = await prisma.tipoServicio.update({
    where: {
      id,
    },
    data: readServiceTypeForm(formData),
    select: serviceSelect,
  });

  revalidatePath("/admin/servicios");

  return serializeServiceType(service);
}
