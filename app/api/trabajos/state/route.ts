import { NextRequest, NextResponse } from "next/server";
import { TrabajoEstado } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth/api-key";

type RequestBody = {
  id_trabajo: string;
  estado: string;
};

const estadoMap: Record<string, TrabajoEstado> = {
  pendiente: TrabajoEstado.PENDIENTE,
  aceptado: TrabajoEstado.ACEPTADO,
  rechazado: TrabajoEstado.RECHAZADO,
  en_camino: TrabajoEstado.EN_CAMINO,
  en_servicio: TrabajoEstado.EN_SERVICIO,
  finalizado: TrabajoEstado.FINALIZADO,
  cancelado: TrabajoEstado.CANCELADO,
};

export async function PUT(req: NextRequest) {
  try {
    const authorized = validateApiKey(req, [
      process.env.RIDER_APP_API_KEY!,
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

    const { id_trabajo, estado } = body;

    if (!id_trabajo || !estado) {
      return NextResponse.json(
        {
          status: "error",
          mensaje: "Faltan parámetros obligatorios",
        },
        {
          status: 400,
        },
      );
    }

    const nuevoEstado = estadoMap[
      estado.toLowerCase()
    ];

    if (!nuevoEstado) {
      return NextResponse.json(
        {
          status: "error",
          mensaje: "Estado inválido",
        },
        {
          status: 400,
        },
      );
    }

    const trabajoExistente =
      await prisma.trabajo.findUnique({
        where: {
          id: id_trabajo,
        },
      });

    if (!trabajoExistente) {
      return NextResponse.json(
        {
          status: "error",
          mensaje: "Trabajo no encontrado",
        },
        {
          status: 404,
        },
      );
    }

    const trabajoActualizado =
      await prisma.trabajo.update({
        where: {
          id: id_trabajo,
        },
        data: {
          estado: nuevoEstado,
          historialEstados: {
            create: {
              estadoAnterior:
                trabajoExistente.estado,
              estadoNuevo: nuevoEstado,
              motivo:
                "Actualización desde Rider App",
            },
          },
        },
      });

    return NextResponse.json({
      status: "success",
      mensaje:
        "Estado del trabajo actualizado correctamente",
      data: {
        id_trabajo:
          trabajoActualizado.id,
        estado_actual:
          trabajoActualizado.estado,
      },
    });
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