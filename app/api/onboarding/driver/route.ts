import {
  auth,
  clerkClient,
} from "@clerk/nextjs/server";

import {
  DriverStatus,
  UserRole,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/prisma";

import {
  NextResponse,
} from "next/server";

export async function POST() {
  const { userId } =
    await auth();

  if (!userId) {
    return NextResponse.json(
      {
        message:
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const clerk =
    await clerkClient();

  const user =
    await clerk.users.getUser(
      userId,
    );

  const role =
    user.publicMetadata
      ?.role;

  // evita ejecutar onboarding dos veces
  if (
    role ===
    "driver"
  ) {
    return NextResponse.json({
      ok: true,
    });
  }

  const email =
    user.emailAddresses[0]
      ?.emailAddress ??
    "";

  const nombre =
    user.firstName ??
    "Usuario";

  const telefono =
    user.phoneNumbers[0]
      ?.phoneNumber ??
    null;

  const imagenURL =
    user.imageUrl ??
    null;

  // 1. setear role
  await clerk.users.updateUser(
    userId,
    {
      publicMetadata: {
        role:
          "driver",
      },
    },
  );

  // 2. crear driver prisma
  await prisma.driver.create(
    {
      data: {
        clerkUserId:
          userId,
        nombre,
        email,
        telefono,
        imagenURL,
        role:
          UserRole.DRIVER,
        status:
          DriverStatus.OFFLINE,
      },
    },
  );

  return NextResponse.json({
    ok: true,
  });
}