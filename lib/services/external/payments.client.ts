import { getBaseUrl } from "@/lib/config/get-base-url";
import type { PaymentDailySummary } from "@/types/dashboard";

export async function getPaymentDailySummary(
  driverId: string,
): Promise<PaymentDailySummary> {
  const response = await fetch(
    `${getBaseUrl()}/api/mocks/payments/wallet/${driverId}`,
    {
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el resumen de pagos");
  }

  return response.json() as Promise<PaymentDailySummary>;
}

export function getPaymentMetrics(payments: PaymentDailySummary) {
  return {
    ingresosDelDia: Number(payments.metricasHoy.facturacionHoy),
    balanceDisponible: Number(payments.balance.disponible),
    trabajosLiquidados: payments.metricasHoy.trabajosRealizadosHoy,
  };
}
