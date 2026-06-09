import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma, TrabajoEstado } from "@prisma/client";
import { validateInternalApiKey } from "@/lib/auth/internal-auth";
import { getRiderCustomerMock } from "@/lib/mocks/rider.mock";

type RequestBody = {
  id_trabajo?: string;
  idTrabajo?: string;
  id_viaje?: string;
  riderId?: string;
  idCliente?: string;
  IdCliente?: string;
  tipoServicioId?: string;
  idTipoServicio?: string;
  direccion?: string;
  ubicacion?: {
    direccion?: string;
  };
  descripcion?: string;
  nombreRider?: string;
  nombreCliente?: string;
  apellidoRider?: string;
  apellidoCliente?: string;
  valoracionRider?: number;
  ratingCliente?: number;
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
    const id_trabajo =
      body.id_trabajo ??
      body.idTrabajo ??
      body.id_viaje;

    const riderId =
      body.riderId ??
      body.idCliente ??
      body.IdCliente;

    const tipoServicioId =
      body.tipoServicioId ??
      body.idTipoServicio;

    const direccion =
      body.direccion ??
      body.ubicacion?.direccion;

    const {
      descripcion,
      fotos,
    } = body;

    const nombreRider =
      body.nombreRider ??
      body.nombreCliente;

    const apellidoRider =
      body.apellidoRider ??
      body.apellidoCliente;

    const valoracionRider =
      body.valoracionRider ??
      body.ratingCliente;

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

    const riderSnapshot = {
      nombre:
        nombreRider?.trim() ||
        riderMock.nombreCliente,
      apellido:
        apellidoRider?.trim() ||
        riderMock.apellidoCliente,
      valoracion:
        typeof valoracionRider ===
          "number" &&
        Number.isFinite(
          valoracionRider,
        )
          ? valoracionRider
          : riderMock.ratingCliente,
    };

    const trabajo =
      await prisma.$transaction(
        async (tx) => {
          const creado =
            await tx.trabajo.create({
              data: {
                id: id_trabajo,
                riderId,
                tipoServicioId,
                descripcion,
                direccion,
                fotos:
                  fotos ?? [],
                estado:
                  TrabajoEstado.PENDIENTE,
                montoEstimado:
                  tipoServicio.precioBase,
                historialEstados: {
                  create: {
                    estadoAnterior: null,
                    estadoNuevo:
                      TrabajoEstado.PENDIENTE,
                    motivo:
                      "Trabajo creado desde Rider App",
                  },
                },
              },
            });

          await tx.$executeRaw`
            UPDATE "Trabajo"
            SET
              "nombreRider" = ${riderSnapshot.nombre},
              "apellidoRider" = ${riderSnapshot.apellido},
              "valoracionRider" = ${riderSnapshot.valoracion}
            WHERE "id" = ${creado.id}
          `;

          return creado;
        },
      );

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
