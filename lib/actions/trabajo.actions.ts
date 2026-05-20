"use server";

import {
  currentUser,
} from "@clerk/nextjs/server";
import {
  prisma,
} from "@/lib/prisma";

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
}
