import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { riderJobRequestsMock } from "@/lib/mocks/rider.mock";
import { serviceTypesMock } from "@/lib/mocks/service-types.mock";
import { JobRequestDetail } from "@/components/dashboard/job-request-detail";
import type { DashboardJobRequest } from "@/types/dashboard";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TrabajoDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await currentUser();
  if (!user) redirect("/login");

  // 1. Buscar primero en la DB (trabajos reales creados por el webhook)
  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true },
  });

  if (driver) {
    const trabajo = await prisma.trabajo.findUnique({
      where: { id },
      include: { tipoServicio: true },
    });

    if (trabajo && trabajo.driverId === driver.id && trabajo.estado === "PENDIENTE") {
      const request: DashboardJobRequest = {
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
        estado: "DISPONIBLE",
        precioEstimado: Number(trabajo.montoEstimado),
      };

      return <JobRequestDetail request={request} />;
    }
  }

  // 2. Fallback al mock (desarrollo local)
  const mockRequest = riderJobRequestsMock.find((r) => r.id === id);
  if (!mockRequest) redirect("/");

  const serviceType = serviceTypesMock.find(
    (s) => s.nombre === mockRequest.tipoServicio,
  );

  const request: DashboardJobRequest = {
    ...mockRequest,
    precioEstimado: serviceType?.precioBase ?? 0,
  };

  return <JobRequestDetail request={request} />;
}
