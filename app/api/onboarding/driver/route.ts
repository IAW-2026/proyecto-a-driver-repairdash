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
import {
  hasValidAppRole,
} from "@/lib/auth/get-user-role";

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

  if (
    !hasValidAppRole(
      role,
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Rol de usuario invalido",
      },
      {
        status: 403,
      },
    );
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

  await prisma.driver.upsert(
    {
      where: {
        clerkUserId:
          userId,
      },
      update: {
        nombre,
        email,
        telefono,
        role:
          UserRole.DRIVER,
        status:
          DriverStatus.OFFLINE,
      },
      create: {
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
