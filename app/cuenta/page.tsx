import { ProfilePage } from "@/components/profile/profile-page";
import {
  getCurrentDriverProfile,
  getAllServiceTypes,
} from "@/lib/services/driver.service";
import { getDriverFeedback } from "@/lib/services/external/feedback.client";
import { getPaymentDailySummary } from "@/lib/services/external/payments.client";

export default async function CuentaPage() {
  const driver =
    await getCurrentDriverProfile();

  const [
    feedback,
    payments,
    allServices,
  ] = await Promise.all([
    getDriverFeedback(
      driver.id,
    ),
    getPaymentDailySummary(
      driver.id,
    ),
    getAllServiceTypes(),
  ]);

  // serializar Decimal
  const safeServices =
    allServices.map(
      (service) => ({
        id: service.id,
        nombre:
          service.nombre,
        descripcion:
          service.descripcion,
        precioBase:
          Number(
            service.precioBase,
          ),
      }),
    );

  return (
    <ProfilePage
      driver={driver}
      feedback={feedback}
      payments={payments}
      allServices={
        safeServices
      }
    />
  );
}