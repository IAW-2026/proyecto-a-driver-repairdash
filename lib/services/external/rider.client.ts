import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/config/get-base-url";
import { TrabajoEstado } from "@prisma/client";
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

type RiderTravelState =
  | "aceptado"
  | "cancelado"
  | "en camino"
  | "ha llegado"
  | "finalizado";

const riderStateMap: Partial<Record<TrabajoEstado, RiderTravelState>> = {
  ACEPTADO: "aceptado",
  CANCELADO: "cancelado",
  EN_CAMINO: "en camino",
  EN_SERVICIO: "ha llegado",
  FINALIZADO: "finalizado",
};

function getRiderStateUrl() {
  return (
    process.env.RIDER_APP_URL ??
    `${getBaseUrl()}statetravel`
  ).replace(/\/+$/, "");
}

export async function notifyRiderTrabajoState(input: {
  trabajoId: string;
  estado: TrabajoEstado;
  driverId?: string;
}) {
  const estado =
    riderStateMap[input.estado];

  if (!estado) {
    return;
  }

  try {
    const url =
      getRiderStateUrl();

    const response = await fetch(
      url,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.RIDER_INTERNAL_API_KEY ?? "",
          "x-internal-api-key": process.env.RIDER_INTERNAL_API_KEY ?? "",
        },
        body: JSON.stringify({
          id_viaje: input.trabajoId,
          estado,
          driver: input.driverId,
        }),
      },
    );

    if (!response.ok) {
      const responseBody =
        await response.text();

      console.warn(
        "Rider state API returned",
        response.status,
        {
          url,
          body: responseBody,
        },
      );
    }
  } catch (error) {
    console.warn(
      "Rider state API unavailable",
      error,
    );
  }
}
