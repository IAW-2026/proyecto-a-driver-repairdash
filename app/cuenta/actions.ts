"use server";

import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadAvatar } from "@/lib/supabase";
import { syncDriverOnboarding } from "@/lib/services/update-onboarding";
import { normalizePhone } from "@/lib/utils/prisma-normalizers";

export async function updateProfileData(
  formData: FormData,
) {
  const user =
    await currentUser();

  if (!user) {
    throw new Error(
      "No autenticado",
    );
  }

  const nombre =
    formData.get(
      "nombre",
    ) as string | null;

  const telefono =
    formData.get(
      "telefono",
    ) as string | null;

  const bio =
    formData.get(
      "bio",
    ) as string | null;

  const driver =
    await prisma.driver.findUnique(
      {
        where: {
          clerkUserId:
            user.id,
        },
      },
    );

  if (!driver) {
    throw new Error(
      "Driver no encontrado",
    );
  }

  // =========================
  // VALIDAR TELEFONO DUPLICADO
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
              id:
                driver.id,
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
  // UPDATE
  // =========================

  await prisma.driver.update(
    {
      where: {
        id:
          driver.id,
      },
      data: {
        ...(nombre !==
          null && {
          nombre:
            nombre.trim(),
        }),

        ...(telefono !==
          null && {
          telefono:
            telefono.trim() ||
            null,

          telefonoNormalizado,
        }),

        ...(bio !==
          null && {
          bio:
            bio.trim() ||
            null,
        }),
      },
    },
  );

  await syncDriverOnboarding(
    driver.id,
  );

  revalidatePath(
    "/cuenta",
  );

  revalidatePath(
    "/",
    "layout",
  );

  return {
    success: true,
  };
}

export async function updateProfilePhoto(
  formData: FormData,
) {
  const user =
    await currentUser();

  if (!user) {
    throw new Error(
      "No autenticado",
    );
  }

  const file =
    formData.get(
      "avatar",
    ) as File | null;

  if (!file) {
    throw new Error(
      "No se recibió imagen",
    );
  }

  const driver =
    await prisma.driver.findUnique(
      {
        where: {
          clerkUserId:
            user.id,
        },
      },
    );

  if (!driver) {
    throw new Error(
      "Driver no encontrado",
    );
  }

  const imageUrl =
    await uploadAvatar(
      driver.id,
      file,
    );

  await prisma.driver.update(
    {
      where: {
        id:
          driver.id,
      },
      data: {
        imagenURL:
          imageUrl,
      },
    },
  );

  await syncDriverOnboarding(
    driver.id,
  );

  revalidatePath(
    "/cuenta",
  );

  return {
    success: true,
  };
}

export async function updateDriverServices(
  formData: FormData,
) {
  const { userId } =
    await auth();

  if (!userId) {
    throw new Error(
      "No autenticado",
    );
  }

  const serviceIds =
    formData.getAll(
      "serviceIds",
    ) as string[];

  const driver =
    await prisma.driver.findUnique(
      {
        where: {
          clerkUserId:
            userId,
        },
      },
    );

  if (!driver) {
    throw new Error(
      "Driver no encontrado",
    );
  }

  await prisma.$transaction(
    async (tx) => {
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
                  serviceId,
                ) => ({
                  driverId:
                    driver.id,
                  tipoServicioId:
                    serviceId,
                }),
              ),
          },
        );
      }
    },
  );

  await syncDriverOnboarding(
    driver.id,
  );

  revalidatePath(
    "/cuenta",
  );

  return {
    success: true,
  };
}
