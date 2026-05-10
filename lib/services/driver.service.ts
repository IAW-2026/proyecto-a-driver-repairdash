import { serviceTypesMock } from "@/lib/mocks/service-types.mock";
import type { DriverDashboardProfile } from "@/types/dashboard";

export async function getCurrentDriverProfile(): Promise<DriverDashboardProfile> {
  return {
    id: "driver_manuel",
    nombre: "Manuel",
    status: "ONLINE",
    servicios: serviceTypesMock.filter((service) =>
      ["Plomeria", "Electricidad", "Gas"].includes(service.nombre),
    ),
  };
}
