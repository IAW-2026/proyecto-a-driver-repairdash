"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { uploadAvatar } from "@/lib/supabase";

export async function updateProfileData(
  formData: FormData,
) {

const user = await currentUser();

if (!user) {
  throw new Error("No autenticado");
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

  await prisma.driver.update(
    {
      where: {
        id: driver.id,
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

  revalidatePath(
    "/cuenta",
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
        id: driver.id,
      },
      data: {
        imagenURL:
          imageUrl,
      },
    },
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

  revalidatePath(
    "/cuenta",
  );

  return {
    success: true,
  };
}