import {
  auth,
  currentUser,
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

export async function getCurrentRole() {
  const user =
    await currentUser();

  if (!user) {
    return null;
  }

  const clerkRole =
    user.publicMetadata
      ?.role;

  // source of truth
  if (
    clerkRole ===
      "driver-admin"
  ) {
    return UserRole.ADMIN;
  }

  if (
    clerkRole ===
      "driver"
  ) {
    return UserRole.DRIVER;
  }

  return null;
}

export async function requireAdmin() {
  const role =
    await getCurrentRole();

  if (
    role !==
    UserRole.ADMIN
  ) {
    throw new Error(
      "Unauthorized",
    );
  }

  return true;
}

export async function isAdmin() {
  const role =
    await getCurrentRole();

  return (
    role ===
    UserRole.ADMIN
  );
}
