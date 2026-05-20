import type {
  PaymentDailySummary,
} from "@/types/dashboard";

export const paymentWalletMock: PaymentDailySummary =
  {
    driverId:
      "mock-driver",

    balance: {
      disponible:
        "95500.00",
    },

    metricasHoy: {
      facturacionHoy:
        "95500.00",

      trabajosRealizadosHoy:
        3,
    },
  };

export function getPaymentWalletMock(
  driverId: string,
): PaymentDailySummary {
  return {
    ...paymentWalletMock,
    driverId,
  };
}
