import { riderJobRequestsMock } from "@/lib/mocks/rider.mock";
import { serviceTypesMock } from "@/lib/mocks/service-types.mock";
import type { DashboardJobRequest } from "@/types/dashboard";

export async function getAvailableRiderRequestsForDriver(
  serviceNames: string[],
): Promise<DashboardJobRequest[]> {
  const offeredServices = new Set(serviceNames);

  return riderJobRequestsMock
    .filter((request) => offeredServices.has(request.tipoServicio))
    .map((request) => {
      const serviceType = serviceTypesMock.find((service) => service.nombre === request.tipoServicio);

      return {
        ...request,
        precioEstimado: serviceType?.precioBase ?? 0,
      };
    });
}
