import { prisma } from "@/lib/prisma";

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
          driverId: true,
        },
      },
      trabajos: {
        where: {
          estado: {
            not: "FINALIZADO",
          },
        },
        select: {
          id: true,
          driverId: true,
        },
      },
    },
  });

  return services.map((service): AdminServiceType => ({
    ...service,
    precioBase: service.precioBase.toNumber(),
    creadoEn: service.creadoEn.toISOString(),
    actualizadoEn: service.actualizadoEn.toISOString(),
  }));
}
