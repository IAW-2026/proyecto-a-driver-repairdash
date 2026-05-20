import { prisma } from "@/lib/prisma";
import type {
  DashboardJobRequest,
  DriverAvailability,
} from "@/types/dashboard";

type AvailableRiderRequestsParams = {
  driverId: string;
  driverStatus: DriverAvailability;
  serviceTypeIds: string[];
};

export async function getAvailableRiderRequestsForDriver(
  {
    driverId,
    driverStatus,
    serviceTypeIds,
  }: AvailableRiderRequestsParams,
): Promise<DashboardJobRequest[]> {
  if (
    driverStatus !==
      "ONLINE" ||
    serviceTypeIds.length ===
      0
  ) {
    return [];
  }

  const trabajos = await prisma.trabajo.findMany({
    where: {
      estado: "PENDIENTE",
      tipoServicioId: {
        in: serviceTypeIds,
      },
      OR: [
        {
          driverId: null,
        },
        {
          driverId,
        },
      ],
      rechazos: {
        none: {
          driverId,
        },
      },
    },
    include: {
      tipoServicio: true,
    },
    orderBy: {
      creadoEn: "desc",
    },
  });

  return trabajos.map((trabajo) => ({
    id: trabajo.id,
    idCliente: trabajo.riderId,
    nombreCliente: "Cliente",
    apellidoCliente: "",
    ratingCliente: 0,
    ubicacion: {
      direccion: trabajo.direccion,
      barrio: "",
    },
    tipoServicio: trabajo.tipoServicio.nombre,
    descripcion: trabajo.descripcion ?? "",
    fotos: trabajo.fotos,
    estado: "DISPONIBLE" as const,
    precioEstimado: Number(trabajo.montoEstimado),
  }));
}
