"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { DriverAvailability } from "@/types/dashboard";

export async function updateDriverAvailability(
  nextStatus: Exclude<DriverAvailability, "EN_TRABAJO">,
): Promise<DriverAvailability> {
  const user = await currentUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const driver = await prisma.driver.update({
    where: { clerkUserId: user.id },
    data: { status: nextStatus },
    select: { status: true },
  });

  revalidatePath("/");

  return driver.status as DriverAvailability;
}
