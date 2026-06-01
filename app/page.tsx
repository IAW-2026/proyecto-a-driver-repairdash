import { prisma } from "@/lib/prisma";
import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { PublicHome } from "@/components/landing/public-home";
import { getCurrentDriverProfile } from "@/lib/services/driver.service";
import { getDriverFeedback } from "@/lib/services/external/feedback.client";
import {
  getPaymentDailySummary,
  getPaymentMetrics,
} from "@/lib/services/external/payments.client";
import { getAvailableRiderRequestsForDriver } from "@/lib/services/external/rider.client";
import type { DriverDailyStats } from "@/types/dashboard";
import { isAdmin } from "@/lib/auth/roles";
import {
  hasValidAppRole,
  isRiderRole,
} from "@/lib/auth/get-user-role";

export default async function HomePage() {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    return <PublicHome />;
  }

  const claims =
    sessionClaims as
      | {
          metadata?: {
            role?: string;
          };
          publicMetadata?: {
            role?: string;
          };
        }
      | undefined;

  const sessionRole =
    claims?.metadata?.role ??
    claims?.publicMetadata
      ?.role;

  const liveUser =
    hasValidAppRole(
      sessionRole,
    )
      ? null
      : await currentUser();

  const role =
    hasValidAppRole(
      sessionRole,
    )
      ? sessionRole
      : liveUser?.publicMetadata
          ?.role;

  if (
    !hasValidAppRole(role)
  ) {
    redirect(
      "/rol-invalido",
    );
  }

  if (
    isRiderRole(role)
  ) {
    redirect(
      "/cuenta-rider",
    );
  }

  const driver =
    await getCurrentDriverProfile();

  const admin =
    await isAdmin();

  // 🔑 Admins NO usan dashboard driver
  if (admin) {
    redirect(
      "/admin/servicios",
    );
  }

  // 🔑 Drivers normales deben completar onboarding
  if (
    !driver.onboardingCompleto
  ) {
    redirect(
      "/onboarding",
    );
  }

  const [
    feedback,
    payments,
    requests,
  ] = await Promise.all([
    getDriverFeedback(
      driver.clerkUserId,
    ),
    getPaymentDailySummary(
      driver.clerkUserId,
    ),
    getAvailableRiderRequestsForDriver(
      {
        driverId:
          driver.id,
        driverStatus:
          driver.status,
        serviceTypeIds:
          driver.servicios.map(
            (
              service,
            ) =>
              service.id,
          ),
      },
    ),
  ]);

  const paymentMetrics =
    getPaymentMetrics(
      payments,
    );

  const stats: DriverDailyStats =
    {
      trabajosCompletados:
        paymentMetrics
          .trabajosLiquidados,
      ingresosDelDia:
        paymentMetrics
          .ingresosDelDia,
      ratingPromedio:
        feedback.valoracion,
    };

  const trabajoRaw =
    await prisma.trabajo.findFirst(
      {
        where: {
          driverId:
            driver.id,
          estado: {
            in: [
              "ACEPTADO",
              "EN_CAMINO",
              "EN_SERVICIO",
            ],
          },
        },
        include: {
          tipoServicio: true,
        },
        orderBy: {
          actualizadoEn:
            "desc",
        },
      },
    );

  const trabajoCanceladoRaw =
    await prisma.trabajo.findFirst(
      {
        where: {
          driverId:
            driver.id,
          estado:
            "CANCELADO",
          historialEstados: {
            some: {
              motivo:
                "Cancelacion desde Rider App",
            },
          },
        },
        include: {
          tipoServicio: true,
        },
        orderBy: {
          actualizadoEn:
            "desc",
        },
      },
    );

  const trabajo =
    trabajoRaw
      ? {
          ...trabajoRaw,
          montoEstimado:
            Number(
              trabajoRaw.montoEstimado,
            ),
          tipoServicio:
            {
              ...trabajoRaw.tipoServicio,
              precioBase:
                Number(
                  trabajoRaw
                    .tipoServicio
                    .precioBase,
                ),
            },
        }
      : undefined;

  const trabajoCancelado =
    trabajoCanceladoRaw
      ? {
          ...trabajoCanceladoRaw,
          montoEstimado:
            Number(
              trabajoCanceladoRaw.montoEstimado,
            ),
          tipoServicio:
            {
              ...trabajoCanceladoRaw.tipoServicio,
              precioBase:
                Number(
                  trabajoCanceladoRaw
                    .tipoServicio
                    .precioBase,
                ),
            },
        }
      : undefined;

  return (
    <DashboardHome
      driver={driver}
      stats={stats}
      requests={requests}
      trabajo={trabajo}
      trabajoCancelado={trabajo ? undefined : trabajoCancelado}
    />
  );
}
