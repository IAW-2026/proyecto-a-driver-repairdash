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
  isRiderRole,
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

  const hasConfiguredRole =
    typeof role === "string" &&
    role.trim().length > 0;

  if (isRiderRole(role)) {
    return NextResponse.json(
      {
        message:
          "Esta cuenta pertenece a RiderApp",
      },
      {
        status: 403,
      },
    );
  }

  if (
    hasConfiguredRole &&
    !hasValidAppRole(role)
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

  if (
    role === "driver-admin"
  ) {
    return NextResponse.json(
      {
        message:
          "La cuenta admin no requiere onboarding de driver",
      },
      {
        status: 403,
      },
    );
  }

  if (!hasConfiguredRole) {
    // El alta propia de DriverApp crea usuarios sin rol y los inicializa como driver.
    // Si el rol existe pero es invalido, se trata como una mala configuracion manual.
    // No se autocorrige para que /rol-invalido pueda exponer el problema.
    await clerk.users.updateUserMetadata(
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
