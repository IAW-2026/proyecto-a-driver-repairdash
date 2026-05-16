import {
  auth,
} from "@clerk/nextjs/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  UserRole,
} from "@prisma/client";

export async function getCurrentDriver() {
  const { userId } =
    await auth();

  if (!userId) {
    return null;
  }

  return prisma.driver.findUnique(
    {
      where: {
        clerkUserId:
          userId,
      },
    },
  );
}

export async function requireAdmin() {
  const driver =
    await getCurrentDriver();

  if (
    !driver ||
    driver.role !==
      UserRole.ADMIN
  ) {
    throw new Error(
      "Unauthorized",
    );
  }

  return driver;
}

export async function isAdmin() {
  const driver =
    await getCurrentDriver();

  return (
    driver?.role ===
    UserRole.ADMIN
  );
}