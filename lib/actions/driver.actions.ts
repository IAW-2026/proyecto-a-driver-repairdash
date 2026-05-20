"use server";

import {
  DriverStatus,
} from "@prisma/client";
import {
  currentUser,
} from "@clerk/nextjs/server";
import {
  revalidatePath,
} from "next/cache";
import {
  prisma,
} from "@/lib/prisma";
import type {
  DriverAvailability,
} from "@/types/dashboard";

export async function updateDriverAvailability(
  nextStatus: Exclude<
    DriverAvailability,
    "EN_TRABAJO"
  >,
): Promise<DriverAvailability> {
  const user =
    await currentUser();

  if (!user) {
    throw new Error(
      "No autenticado",
    );
  }

  const status =
    nextStatus === "ONLINE"
      ? DriverStatus.ONLINE
      : DriverStatus.OFFLINE;

  const driver =
    await prisma.driver.update({
      where: {
        clerkUserId:
          user.id,
      },
      data: {
        status,
      },
      select: {
        status: true,
      },
    });

  revalidatePath(
    "/",
  );

  return driver.status;
}
