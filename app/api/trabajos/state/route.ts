import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { DriverStatus, TrabajoEstado } from "@prisma/client";

import { validateInternalApiKey } from "@/lib/auth/internal-auth";
import { prisma } from "@/lib/prisma";

type RequestBody = {
  id_trabajo: string;
  estado: string;
};

export async function PUT(req: NextRequest) {
  try {
    const authError =
      validateInternalApiKey(
        req,
      );

    if (authError) {
      return authError;
    }

    const body: RequestBody =
      await req.json();

    const {
      id_trabajo,
      estado,
    } = body;

    if (!id_trabajo) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Falta id_trabajo",
        },
        {
          status: 400,
        },
      );
    }

    if (!estado) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Falta estado. Esta API solo acepta estado cancelado",
        },
        {
          status: 400,
        },
      );
    }

    if (
      estado.toLowerCase() !==
      "cancelado"
    ) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Esta API solo acepta cancelaciones",
        },
        {
          status: 400,
        },
      );
    }

    const trabajoExistente =
      await prisma.trabajo.findUnique(
        {
          where: {
            id: id_trabajo,
          },
          select: {
            id: true,
            estado: true,
            driverId: true,
            driver: {
              select: {
                nombre: true,
              },
            },
          },
        },
      );

    if (!trabajoExistente) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Trabajo no encontrado",
        },
        {
          status: 404,
        },
      );
    }

    if (
      trabajoExistente.estado ===
      TrabajoEstado.FINALIZADO
    ) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "No se puede cancelar un trabajo finalizado",
        },
        {
          status: 409,
        },
      );
    }

    const trabajoActualizado =
      await prisma.$transaction(
        async (tx) => {
          const trabajo =
            await tx.trabajo.update(
              {
                where: {
                  id: id_trabajo,
                },
                data: {
                  estado:
                    TrabajoEstado.CANCELADO,
                  historialEstados: {
                    create: {
                      estadoAnterior:
                        trabajoExistente.estado,
                      estadoNuevo:
                        TrabajoEstado.CANCELADO,
                      motivo:
                        "Cancelacion desde Rider App",
                    },
                  },
                },
              },
            );

          if (
            trabajoExistente.driverId
          ) {
            await tx.driver.update(
              {
                where: {
                  id: trabajoExistente.driverId,
                },
                data: {
                  status:
                    DriverStatus.ONLINE,
                },
              },
            );
          }

          return trabajo;
        },
      );

    revalidatePath("/");
    revalidatePath("/trabajos/activo");
    revalidatePath("/admin/servicios");

    return NextResponse.json({
      status: "success",
      mensaje:
        "Trabajo cancelado correctamente",
      data: {
        id_trabajo:
          trabajoActualizado.id,
        estado_actual:
          trabajoActualizado.estado,
        driver_notificado:
          trabajoExistente.driver
            ?.nombre ?? null,
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
