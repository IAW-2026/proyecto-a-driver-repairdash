"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";

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
      driverId: true,
    },
  },
  trabajos: {
    select: {
      id: true,
    },
  },
} as const;

function serializeServiceType(service: {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: { toNumber: () => number };
  creadoEn: Date;
  actualizadoEn: Date;
  driverServicios: { id: string; driverId: string }[];
  trabajos: { id: string }[];
}): AdminServiceType {
  return {
    ...service,
    precioBase: service.precioBase.toNumber(),
    creadoEn: service.creadoEn.toISOString(),
    actualizadoEn: service.actualizadoEn.toISOString(),
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
