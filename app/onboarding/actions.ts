"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadAvatar } from "@/lib/supabase";

export async function completeOnboarding(
  formData: FormData,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No autenticado");
  }

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: userId },
  });

  if (!driver) {
    throw new Error("Driver no encontrado");
  }

  const telefono = formData.get("telefono") as string | null;
  const serviceIds = formData.getAll("serviceIds") as string[];
  const file = formData.get("avatar") as File | null;

  let imagenURL = driver.imagenURL;

  if (file && file.size > 0) {
    imagenURL = await uploadAvatar(driver.id, file);
  }

  await prisma.$transaction(async (tx) => {
    await tx.driver.update({
      where: { id: driver.id },
      data: {
        telefono: telefono?.trim() || null,
        imagenURL,
        onboardingCompleto: true,
      },
    });

    await tx.driverTipoServicio.deleteMany({
      where: { driverId: driver.id },
    });

    if (serviceIds.length > 0) {
      await tx.driverTipoServicio.createMany({
        data: serviceIds.map((tipoServicioId) => ({
          driverId: driver.id,
          tipoServicioId,
        })),
      });
    }
  });

  revalidatePath("/", "layout");

  return { success: true };
}
