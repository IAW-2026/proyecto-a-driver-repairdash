import {
  clerkClient,
  currentUser,
} from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { DriverDashboardProfile } from "@/types/dashboard";
import {
  isRiderRole,
} from "@/lib/auth/get-user-role";

function shouldSetDriverRole(
  role: unknown,
) {
  return (
    role !== "driver" &&
    role !== "driver-admin" &&
    role !== "rider"
  );
}

export async function getCurrentDriverProfile(): Promise<DriverDashboardProfile> {
  const user = await currentUser();

  if (!user) throw new Error("Unauthorized");

  if (
    isRiderRole(
      user.publicMetadata?.role,
    )
  ) {
    throw new Error(
      "Rider accounts cannot access DriverApp",
    );
  }

  if (
    shouldSetDriverRole(
      user.publicMetadata?.role,
    )
  ) {
    const clerk =
      await clerkClient();

    await clerk.users.updateUser(
      user.id,
      {
        publicMetadata: {
          ...user.publicMetadata,
          role: "driver",
        },
      },
    );
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("User email not found");

  let driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    include: {
      tiposServicio: {
        include: { tipoServicio: true },
      },
    },
  });

  if (!driver) {
    driver = await prisma.driver.findUnique({
      where: { email },
      include: {
        tiposServicio: {
          include: { tipoServicio: true },
        },
      },
    });

    if (driver) {
      driver = await prisma.driver.update({
        where: { id: driver.id },
        data: { clerkUserId: user.id },
        include: {
          tiposServicio: {
            include: { tipoServicio: true },
          },
        },
      });
    } else {
      driver = await prisma.driver.create({
      data: {
        clerkUserId: user.id,
        nombre:
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
          user.username ||
          "Driver",
        email,
        status: "OFFLINE",
      },
      include: {
        tiposServicio: {
          include: { tipoServicio: true },
        },
      },
    });
    }
  }

  return {
  id: driver.id,
  clerkUserId: driver.clerkUserId,
  onboardingCompleto:
    (driver as { onboardingCompleto?: boolean }).onboardingCompleto ?? false,
  nombre: driver.nombre,
  email: driver.email,
  telefono:
    driver.telefono ??
    null,
  bio:
    driver.bio ??
    null,
  imagenURL:
    driver.imagenURL ??
    null,
  status:
    driver.status,
  role:
    driver.role,
  servicios:
    driver.tiposServicio.map(
      (ds) => ({
        id:
          ds.tipoServicio.id,
        nombre:
          ds.tipoServicio.nombre,
        descripcion:
          ds.tipoServicio.descripcion,
        precioBase:
          Number(
            ds.tipoServicio
              .precioBase,
          ),
      }),
    ),
};
}

export async function getAllServiceTypes() {
  return prisma.tipoServicio.findMany({ orderBy: { nombre: "asc" } });
}
