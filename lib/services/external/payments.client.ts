import type {
  PaymentDailySummary,
} from "@/types/dashboard";
import {
  getPaymentWalletMock,
} from "@/lib/mocks/payments.mock";

export async function getPaymentDailySummary(
  driverId: string,
): Promise<PaymentDailySummary> {
  return getPaymentWalletMock(
    driverId,
  );
}
