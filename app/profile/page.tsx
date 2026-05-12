import { getCurrentDriverProfile, getAllServiceTypes } from "@/lib/services/driver.service";
import { getDriverFeedback } from "@/lib/services/external/feedback.client";
import { getPaymentDailySummary } from "@/lib/services/external/payments.client";
import { ProfilePage } from "@/components/profile/profile-page";

export default async function DriverProfilePage() {
  const driver = await getCurrentDriverProfile();

  const [feedback, payments, allServices] = await Promise.all([
    getDriverFeedback(driver.id),
    getPaymentDailySummary(driver.id),
    getAllServiceTypes(),
  ]);

  const allServicesDto = allServices.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion,
    precioBase: Number(s.precioBase),
  }));

  return (
    <ProfilePage
      driver={driver}
      feedback={feedback}
      payments={payments}
      allServices={allServicesDto}
    />
  );
}
