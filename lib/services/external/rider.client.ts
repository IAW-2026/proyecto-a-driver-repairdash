import { prisma } from "@/lib/prisma";
import type { DashboardJobRequest } from "@/types/dashboard";

export async function getAvailableRiderRequestsForDriver(
  driverId: string,
): Promise<DashboardJobRequest[]> {
  const trabajos = await prisma.trabajo.findMany({
    where: {
      driverId,
      estado: "PENDIENTE",
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
    fotos: [],
    estado: "DISPONIBLE" as const,
    precioEstimado: Number(trabajo.montoEstimado),
  }));
}