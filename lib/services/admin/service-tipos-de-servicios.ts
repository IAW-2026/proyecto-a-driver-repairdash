import { prisma } from "@/lib/prisma";

export async function getServiceTypes() {
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