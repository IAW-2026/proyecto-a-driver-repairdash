import type {
  PaymentDailySummary,
} from "@/types/dashboard";

export async function getPaymentDailySummary(
  driverId: string,
): Promise<PaymentDailySummary> {
  const baseUrl =
    process.env
      .NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const response =
    await fetch(
      `${baseUrl}/api/mocks/payments/wallet/${driverId}`,
      {
        method:
          "GET",

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      "Error obteniendo wallet de payments",
    );
  }

  return response.json();
}