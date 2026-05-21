import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { prisma } from "@/lib/prisma";
import { getCurrentDriverProfile } from "@/lib/services/driver.service";
import { getDriverFeedback } from "@/lib/services/external/feedback.client";
import { getPaymentDailySummary } from "@/lib/services/external/payments.client";
import { getAvailableRiderRequestsForDriver } from "@/lib/services/external/rider.client";
import type { DriverDailyStats } from "@/types/dashboard";

export default async function HomePage() {
  const driver = await getCurrentDriverProfile();

  const [feedback, payments, requests] = await Promise.all([
    getDriverFeedback(driver.id),
    getPaymentDailySummary(driver.id),
    getAvailableRiderRequestsForDriver({
      driverId: driver.id,
      driverStatus: driver.status,
      serviceTypeIds: driver.servicios.map(
        (service) => service.id,
      ),
    }),
  ]);

  const stats: DriverDailyStats = {
    trabajosCompletados: payments.metricasHoy.trabajosRealizadosHoy,
    ingresosDelDia: Number(payments.metricasHoy.facturacionHoy),
    ratingPromedio: feedback.valoracion,
    tiempoConectado: "6h 20m",
  };

  const trabajo = await prisma.trabajo.findFirst({
    where: {
      driverId: driver.id,
      estado: { in: ["ACEPTADO", "EN_CAMINO", "EN_SERVICIO"] },
    },
    include: { tipoServicio: true },
    orderBy: { actualizadoEn: "desc" },
  });

  return (
    <DashboardHome
      driver={driver}
      stats={stats}
      requests={requests}
      trabajo={trabajo ?? undefined}
    />
  );

}
