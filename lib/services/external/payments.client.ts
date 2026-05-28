import { getBaseUrl } from "@/lib/config/get-base-url";
import { getPaymentWalletMock } from "@/lib/mocks/payments.mock";
import type { PaymentDailySummary } from "@/types/dashboard";

function getPaymentsBaseUrl() {
  const configuredUrl =
    process.env.PAYMENTS_APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(
      /\/+$/,
      "",
    );
  }

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    return `${getBaseUrl()}/api/mocks/payments`;
  }

  return null;
}

function getEmptyPaymentSummary(
  driverId: string,
): PaymentDailySummary {
  return {
    driverId,
    balance: {
      disponible: "0",
    },
    metricasHoy: {
      facturacionHoy: "0",
      trabajosRealizadosHoy: 0,
    },
  };
}

function getPaymentsWalletUrl(
  baseUrl: string,
  driverId: string,
) {
  const walletBaseUrl =
    baseUrl.endsWith(
      "/payments",
    ) ||
    baseUrl.endsWith(
      "/mocks/payments",
    )
      ? baseUrl
      : `${baseUrl}/payments`;

  return `${walletBaseUrl}/wallet/${driverId}`;
}

export async function getPaymentDailySummary(
  driverId: string,
): Promise<PaymentDailySummary> {
  const baseUrl =
    getPaymentsBaseUrl();

  if (!baseUrl) {
    console.warn(
      "PAYMENTS_APP_URL is not configured",
    );

    return getEmptyPaymentSummary(
      driverId,
    );
  }

  const url = getPaymentsWalletUrl(
    baseUrl,
    driverId,
  );

  try {
    const response = await fetch(
      url,
      {
        headers: {
          "x-internal-api-key":
            process.env.PAYMENTS_INTERNAL_API_KEY ?? "",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    if (response.ok) {
      return response.json() as Promise<PaymentDailySummary>;
    }

    if (response.status === 404) {
      return getEmptyPaymentSummary(
        driverId,
      );
    }

    console.warn(
      "Payments API returned",
      response.status,
      process.env.NODE_ENV === "production"
        ? "using empty summary"
        : "using local fallback",
    );
  } catch (error) {
    console.warn(
      process.env.NODE_ENV === "production"
        ? "Payments API unavailable, using empty summary"
        : "Payments API unavailable, using local fallback",
      error,
    );
  }

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return getEmptyPaymentSummary(
      driverId,
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
