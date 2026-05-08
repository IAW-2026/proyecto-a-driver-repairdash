import { DashboardHome } from "@/components/dashboard/dashboard-home";
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
    getAvailableRiderRequestsForDriver(driver.servicios.map((service) => service.nombre)),
  ]);

  const stats: DriverDailyStats = {
    trabajosCompletados: payments.trabajosLiquidados,
    ingresosDelDia: payments.ingresosDelDia,
    ratingPromedio: feedback.valoracion,
    tiempoConectado: "6h 20m",
  };

  return <DashboardHome driver={driver} stats={stats} requests={requests} />;
}
