import { prisma } from "@/lib/prisma";
import { TrabajoEstado } from "@prisma/client";

export type AdminServiceType = {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  creadoEn: string;
  actualizadoEn: string;
  driverServicios: {
    id: string;
    driverId: string;
  }[];
  trabajos: {
    id: string;
    driverId: string | null;
  }[];
};

export async function getServiceTypes() {
  const services = await prisma.tipoServicio.findMany({
    orderBy: {
      nombre: "asc",
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precioBase: true,
      creadoEn: true,
      actualizadoEn: true,
      driverServicios: {
        select: {
          id: true,
          driver: {
            select: {
              clerkUserId: true,
            },
          },
        },
      },
      trabajos: {
        where: {
          estado: {
            notIn: [
              TrabajoEstado.FINALIZADO,
              TrabajoEstado.CANCELADO,
            ],
          },
        },
        select: {
          id: true,
          driver: {
            select: {
              clerkUserId: true,
            },
          },
        },
      },
    },
  });

  return services.map((service): AdminServiceType => ({
    id: service.id,
    nombre: service.nombre,
    descripcion: service.descripcion,
    precioBase: service.precioBase.toNumber(),
    creadoEn: service.creadoEn.toISOString(),
    actualizadoEn: service.actualizadoEn.toISOString(),
    driverServicios: service.driverServicios.map((driverService) => ({
      id: driverService.id,
      driverId: driverService.driver.clerkUserId,
    })),
    trabajos: service.trabajos.map((trabajo) => ({
      id: trabajo.id,
      driverId: trabajo.driver?.clerkUserId ?? null,
    })),
  }));
}
