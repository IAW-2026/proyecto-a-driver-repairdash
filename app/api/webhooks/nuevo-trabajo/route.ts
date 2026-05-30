import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma, TrabajoEstado } from "@prisma/client";
import { validateInternalApiKey } from "@/lib/auth/internal-auth";
import { getRiderCustomerMock } from "@/lib/mocks/rider.mock";

type RequestBody = {
  id_trabajo: string;
  riderId: string;
  tipoServicioId: string;
  direccion: string;
  descripcion?: string;
  nombreRider?: string;
  apellidoRider?: string;
  valoracionRider?: number;
  fotos?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const authError =
      validateInternalApiKey(
        req,
      );

    if (authError)
      return authError;

    const body: RequestBody = await req.json();
    const {
      id_trabajo,
      riderId,
      tipoServicioId,
      direccion,
      descripcion,
      fotos,
      nombreRider,
      apellidoRider,
      valoracionRider,
    } = body;

    if (
      !id_trabajo ||
      !riderId ||
      !tipoServicioId ||
      !direccion
    ) {
      return NextResponse.json(
        { status: "error", mensaje: "Faltan parámetros obligatorios" },
        { status: 400 },
      );
    }

    const tipoServicio = await prisma.tipoServicio.findUnique({
      where: { id: tipoServicioId },
    });

    if (!tipoServicio) {
      return NextResponse.json(
        { status: "error", mensaje: "Tipo de servicio no encontrado" },
        { status: 404 },
      );
    }

    // Crear el trabajo sin asignar driver — visible para todos los drivers ONLINE
    // con ese tipo de servicio habilitado
    const trabajoExistente = await prisma.trabajo.findUnique({
      where: {
        id: id_trabajo,
      },
      select: {
        id: true,
      },
    });

    if (trabajoExistente) {
      return NextResponse.json(
        { status: "error", mensaje: "El trabajo ya existe" },
        { status: 409 },
      );
    }

    const riderMock =
      getRiderCustomerMock(
        riderId,
      );

    const trabajo = await prisma.trabajo.create({
      data: {
        id: id_trabajo,
        riderId,
        nombreRider:
          nombreRider?.trim() ||
          riderMock.nombreCliente,
        apellidoRider:
          apellidoRider?.trim() ||
          riderMock.apellidoCliente,
        valoracionRider:
          typeof valoracionRider ===
          "number"
            ? valoracionRider
            : riderMock.ratingCliente,
        tipoServicioId,
        descripcion,
        direccion,
        fotos:
          fotos ?? [],
        estado: TrabajoEstado.PENDIENTE,
        montoEstimado: tipoServicio.precioBase,
        historialEstados: {
          create: {
            estadoAnterior: null,
            estadoNuevo: TrabajoEstado.PENDIENTE,
            motivo: "Trabajo creado desde Rider App",
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/servicios");

    return NextResponse.json(
      {
        status: "success",
        mensaje: "Trabajo creado correctamente",
        data: {
          id_trabajo: trabajo.id,
          estado_actual: trabajo.estado,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { status: "error", mensaje: "El trabajo ya existe" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { status: "error", mensaje: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
