import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrabajoEstado } from "@prisma/client";
import { validateInternalApiKey } from "@/lib/auth/internal-auth";

type RequestBody = {
  riderId: string;
  tipoServicioId: string;
  direccion: string;
  descripcion?: string;
  fotos?: string[];
  latitud?: number;
  longitud?: number;
};

export async function POST(req: NextRequest) {
  try {
    const authError =
      validateInternalApiKey(
        req,
        process.env
          .DRIVER_RIDER_WEBHOOK_API_KEY_HASH,
      );

    if (authError)
      return authError;

    const body: RequestBody = await req.json();
    const {
      riderId,
      tipoServicioId,
      direccion,
      descripcion,
      fotos,
      latitud,
      longitud,
    } = body;

    if (!riderId || !tipoServicioId || !direccion) {
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
    const trabajo = await prisma.trabajo.create({
      data: {
        riderId,
        tipoServicioId,
        descripcion,
        direccion,
        fotos:
          fotos ?? [],
        latitud,
        longitud,
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
    return NextResponse.json(
      { status: "error", mensaje: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
