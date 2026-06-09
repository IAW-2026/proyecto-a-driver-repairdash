import {
  DriverStatus,
  TrabajoEstado,
} from "@prisma/client";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  validateControlPlaneApiKey,
} from "@/lib/control-plane/auth";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function GET(
  req: NextRequest,
) {
  const authError =
    validateControlPlaneApiKey(
      req,
    );

  if (authError) {
    return authError;
  }

  const [
    totalWorkers,
    onlineWorkers,
    busyWorkers,
    onboardingPending,
    activeJobs,
    pendingJobs,
    serviceTypes,
  ] = await Promise.all([
    prisma.driver.count(),
    prisma.driver.count({
      where: {
        status:
          DriverStatus.ONLINE,
      },
    }),
    prisma.driver.count({
      where: {
        status:
          DriverStatus.EN_TRABAJO,
      },
    }),
    prisma.driver.count({
      where: {
        onboardingCompleto:
          false,
      },
    }),
    prisma.trabajo.count({
      where: {
        estado: {
          in: [
            TrabajoEstado.PENDIENTE,
            TrabajoEstado.ACEPTADO,
            TrabajoEstado.EN_CAMINO,
            TrabajoEstado.EN_SERVICIO,
          ],
        },
      },
    }),
    prisma.trabajo.count({
      where: {
        estado:
          TrabajoEstado.PENDIENTE,
      },
    }),
    prisma.tipoServicio.count(),
  ]);

  return NextResponse.json({
    status: "success",
    data: {
      app: "driver",
      checkedAt:
        new Date().toISOString(),
      workers: {
        total: totalWorkers,
        online: onlineWorkers,
        enTrabajo: busyWorkers,
        onboardingPendiente:
          onboardingPending,
      },
      jobs: {
        activos: activeJobs,
        pendientes: pendingJobs,
      },
      serviceTypes: {
        total: serviceTypes,
      },
    },
  });
}

