import { prisma } from "@/lib/prisma";
import type { Service } from "@/app/admin/servicios/service-card"; 

export async function getServiceTypes(): Promise<Service[]> {
  const services = await prisma.tipoServicio.findMany({
    orderBy: {
      nombre: "asc",
    },
  });

  return services.map((service) => ({
    ...service,
    precioBase: Number(service.precioBase),
  }));
}