import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrabajoEstado } from "@prisma/client";
import { validateApiKey } from "@/lib/auth/api-key";

type RequestBody = {
  riderId: string;
  tipoServicioId: string;
  direccion: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
};

export async function POST(req: NextRequest) {
  try {
    const authorized = validateApiKey(req, [
      process.env.RIDER_WEBHOOK_API_KEY!,
    ]);

    if (!authorized) {
      return NextResponse.json(
        {
          status: "error",
          mensaje: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body: RequestBody = await req.json();

    const {
      riderId,
      tipoServicioId,
      direccion,
      descripcion,
      latitud,
      longitud,
    } = body;

    if (
      !riderId ||
      !tipoServicioId ||
      !direccion
    ) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Faltan parámetros obligatorios",
        },
        {
          status: 400,
        },
      );
    }

    // Buscar tipo de servicio
    const tipoServicio =
      await prisma.tipoServicio.findUnique({
        where: {
          id: tipoServicioId,
        },
      });

    if (!tipoServicio) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Tipo de servicio no encontrado",
        },
        {
          status: 404,
        },
      );
    }

    // Buscar driver disponible
    // (simple por ahora)
    const driver =
      await prisma.driver.findFirst({
        where: {
          status: "ONLINE",
          tiposServicio: {
            some: {
              tipoServicioId,
            },
          },
        },
      });

    if (!driver) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "No hay drivers disponibles",
        },
        {
          status: 404,
        },
      );
    }

    // Crear trabajo
    const trabajo =
      await prisma.trabajo.create({
        data: {
          driverId: driver.id,
          riderId,
          tipoServicioId,
          descripcion,
          direccion,
          latitud,
          longitud,
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

    return NextResponse.json(
      {
        status: "success",
        mensaje:
          "Trabajo creado correctamente",
        data: {
          id_trabajo: trabajo.id,
          id_driver: driver.id,
          estado_actual:
            trabajo.estado,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: "error",
        mensaje:
          "Error interno del servidor",
      },
      {
        status: 500,
      },
    );
  }
}