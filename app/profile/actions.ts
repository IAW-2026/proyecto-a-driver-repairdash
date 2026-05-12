"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { uploadAvatar } from "@/lib/supabase";

// ─── Actualizar datos personales ────────────────────────────────────────────

export async function updateProfileData(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const nombre = formData.get("nombre");
  const telefono = formData.get("telefono");
  const bio = formData.get("bio");

  if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
    throw new Error("El nombre debe tener al menos 2 caracteres");
  }

  await prisma.driver.update({
    where: { clerkUserId: user.id },
    data: {
      nombre: nombre.trim(),
      telefono: typeof telefono === "string" ? telefono.trim() || null : null,
      bio: typeof bio === "string" ? bio.trim() || null : null,
    },
  });

  revalidatePath("/profile");
}

// ─── Actualizar foto de perfil ───────────────────────────────────────────────

export async function updateProfilePhoto(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Archivo inválido");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no puede superar los 5MB");
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("Solo se permiten imágenes JPG, PNG o WEBP");
  }

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true },
  });

  if (!driver) throw new Error("Driver no encontrado");

  const imageUrl = await uploadAvatar(driver.id, file);

  await prisma.driver.update({
    where: { clerkUserId: user.id },
    data: { imagenURL: imageUrl },
  });

  revalidatePath("/profile");
}

// ─── Actualizar servicios habilitados ───────────────────────────────────────

export async function updateDriverServices(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true },
  });

  if (!driver) throw new Error("Driver no encontrado");

  // Los checkboxes marcados llegan como entries con name="servicios"
  const selectedIds = formData.getAll("servicios").map(String);

  // Reemplazar todos los servicios en una transacción
  await prisma.$transaction([
    prisma.driverTipoServicio.deleteMany({
      where: { driverId: driver.id },
    }),
    ...(selectedIds.length > 0
      ? [
          prisma.driverTipoServicio.createMany({
            data: selectedIds.map((tipoServicioId) => ({
              driverId: driver.id,
              tipoServicioId,
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/profile");
}
