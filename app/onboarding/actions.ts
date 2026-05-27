"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadAvatar } from "@/lib/supabase";
import { checkDriverOnboarding } from "@/lib/services/driver-onboarding.service";
import { normalizePhone } from "@/lib/utils/prisma-normalizers";

export async function completeOnboarding(
  formData: FormData,
) {
  const { userId } =
    await auth();

  if (!userId) {
    throw new Error(
      "No autenticado",
    );
  }

  const driver =
    await prisma.driver.findUnique({
      where: {
        clerkUserId:
          userId,
      },
    });

  if (!driver) {
    throw new Error(
      "Driver no encontrado",
    );
  }

  const telefono =
    formData.get(
      "telefono",
    ) as string | null;

  const serviceIds =
    formData.getAll(
      "serviceIds",
    ) as string[];

  const file =
    formData.get(
      "avatar",
    ) as File | null;

  let imagenURL =
    driver.imagenURL;

  // =========================
  // validar telefono
  // =========================

  let telefonoNormalizado:
    | string
    | null = null;

  if (
    telefono?.trim()
  ) {
    telefonoNormalizado =
      normalizePhone(
        telefono,
      );

    const existingDriver =
      await prisma.driver.findFirst(
        {
          where: {
            telefonoNormalizado,
            NOT: {
              id: driver.id,
            },
          },
        },
      );

    if (
      existingDriver
    ) {
      throw new Error(
        "Ya existe un usuario con ese número de teléfono",
      );
    }
  }

  // =========================
  // subir avatar
  // =========================

  if (
    file &&
    file.size > 0
  ) {
    imagenURL =
      await uploadAvatar(
        driver.id,
        file,
      );
  }

  // =========================
  // persistencia
  // =========================

  await prisma.$transaction(
    async (tx) => {
      await tx.driver.update({
        where: {
          id:
            driver.id,
        },
        data: {
          telefono:
            telefono?.trim() ||
            null,

          telefonoNormalizado,

          imagenURL,
        },
      });

      await tx.driverTipoServicio.deleteMany(
        {
          where: {
            driverId:
              driver.id,
          },
        },
      );

      if (
        serviceIds.length >
        0
      ) {
        await tx.driverTipoServicio.createMany(
          {
            data:
              serviceIds.map(
                (
                  tipoServicioId,
                ) => ({
                  driverId:
                    driver.id,
                  tipoServicioId,
                }),
              ),
          },
        );
      }
    },
  );

  // =========================
  // onboarding completo
  // =========================

  const onboarding =
    await checkDriverOnboarding(
      driver.id,
    );

  await prisma.driver.update({
    where: {
      id:
        driver.id,
    },
    data: {
      onboardingCompleto:
        onboarding.completed,
    },
  });

  revalidatePath(
    "/",
    "layout",
  );

  return {
    success:
      onboarding.completed,
    missingFields:
      onboarding.missingFields,
  };
}