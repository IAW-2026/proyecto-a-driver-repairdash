import { getCurrentDriverProfile } from "@/lib/services/driver.service";
import { getDriverFeedback } from "@/lib/services/external/feedback.client";
import { getPaymentDailySummary } from "@/lib/services/external/payments.client";
import { ProfilePage } from "@/components/profile/profile-page";

export default async function DriverProfilePage() {
  const driver = await getCurrentDriverProfile();

  const [feedback, payments] = await Promise.all([
    getDriverFeedback(driver.id),
    getPaymentDailySummary(driver.id),
  ]);

  return (
    <ProfilePage
      driver={driver}
      feedback={feedback}
      payments={payments}
    />
  );
}