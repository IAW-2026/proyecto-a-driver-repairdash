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

function shouldSetDriverRole(
  role: unknown,
) {
  return (
    role !== "driver" &&
    role !== "driver-admin" &&
    role !== "admin"
  );
}

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
    shouldSetDriverRole(
      role,
    )
  ) {
    await clerk.users.updateUser(
      userId,
      {
        publicMetadata: {
          ...user.publicMetadata,
          role:
            "driver",
        },
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
        imagenURL,
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
