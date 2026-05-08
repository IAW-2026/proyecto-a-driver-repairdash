import { paymentDailySummaryMock } from "@/lib/mocks/payments.mock";
import type { PaymentDailySummary } from "@/types/dashboard";

export async function getPaymentDailySummary(driverId: string): Promise<PaymentDailySummary> {
  return {
    ...paymentDailySummaryMock,
    driverId,
  };
}
