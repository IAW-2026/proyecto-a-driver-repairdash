import { prisma } from "@/lib/prisma";

export async function checkDriverOnboarding(
  driverId: string,
) {
  const driver =
    await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
      include: {
        tiposServicio: {
          include: { tipoServicio: true },
        },
      },
    });

  if (!driver) {
    return {
      completed: false,
      missingFields: [],
    };
  }

  const missingFields: string[] =
    [];

  if (
    !driver.telefono?.trim()
  ) {
    missingFields.push(
      "telefono",
    );
  }

  if (
    !driver.imagenURL?.trim()
  ) {
    missingFields.push(
      "fotoPerfil",
    );
  }

  if (
    driver.tiposServicio.length === 0
  ) {
    missingFields.push(
      "servicios",
    );
  }

  return {
    completed:
      missingFields.length ===
      0,
    missingFields,
  };
}