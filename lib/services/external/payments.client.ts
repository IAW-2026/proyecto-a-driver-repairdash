import { getBaseUrl } from "@/lib/config/get-base-url";
import { getPaymentWalletMock } from "@/lib/mocks/payments.mock";
import type { PaymentDailySummary } from "@/types/dashboard";

export async function getPaymentDailySummary(
  driverId: string,
): Promise<PaymentDailySummary> {
  const url =
    `${getBaseUrl()}/api/mocks/payments/wallet/${driverId}`;

  try {
    const response = await fetch(
      url,
      {
        headers: {
          "x-api-key": process.env.PAYMENTS_INTERNAL_API_KEY ?? "",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    if (response.ok) {
      return response.json() as Promise<PaymentDailySummary>;
    }

    console.warn(
      "Payments mock API returned",
      response.status,
      "using local fallback",
    );
  } catch (error) {
    console.warn(
      "Payments mock API unavailable, using local fallback",
      error,
    );
  }

  return getPaymentWalletMock(driverId);
}

export function getPaymentMetrics(payments: PaymentDailySummary) {
  return {
    ingresosDelDia: Number(payments.metricasHoy.facturacionHoy),
    balanceDisponible: Number(payments.balance.disponible),
    trabajosLiquidados: payments.metricasHoy.trabajosRealizadosHoy,
  };
}
