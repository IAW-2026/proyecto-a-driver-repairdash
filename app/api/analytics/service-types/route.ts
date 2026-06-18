import {
  TrabajoEstado,
} from "@prisma/client";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  validateAnalyticsApiKey,
} from "@/lib/analytics/auth";
import {
  getAnalyticsDateRange,
} from "@/lib/analytics/date-range";
import {
  ACTIVE_JOB_STATES,
  calculateAverageCompletionMinutes,
} from "@/lib/analytics/metrics";
import {
  serializeMoney,
} from "@/lib/analytics/serializers";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function GET(
  req: NextRequest,
) {
  const authError =
    validateAnalyticsApiKey(
      req,
    );

  if (authError) {
    return authError;
  }

  const rangeResult =
    getAnalyticsDateRange(
      req,
    );

  if (!rangeResult.ok) {
    return NextResponse.json(
      {
        status: "error",
        message:
          rangeResult.message,
      },
      {
        status: 400,
      },
    );
  }

  const { range } =
    rangeResult;

  const services =
    await prisma.tipoServicio.findMany(
      {
        orderBy: {
          nombre: "asc",
        },
        select: {
          id: true,
          nombre: true,
          driverServicios: {
            select: {
              driverId: true,
            },
          },
          trabajos: {
            where: {
              creadoEn: {
                gte: range.from,
                lte: range.to,
              },
            },
            select: {
              id: true,
              estado: true,
              creadoEn: true,
              montoEstimado: true,
              historialEstados: {
                where: {
                  estadoNuevo: {
                    in: [
                      TrabajoEstado.ACEPTADO,
                      TrabajoEstado.FINALIZADO,
                    ],
                  },
                },
                select: {
                  trabajoId: true,
                  estadoNuevo: true,
                  creadoEn: true,
                },
                orderBy: {
                  creadoEn: "asc",
                },
              },
            },
          },
        },
      },
    );

  const data =
    services.map(
      (service) => {
        const trabajos =
          service.trabajos;
        const finalizados =
          trabajos.filter(
            (trabajo) =>
              trabajo.estado ===
              TrabajoEstado.FINALIZADO,
          );
        const histories =
          trabajos.flatMap(
            (trabajo) =>
              trabajo.historialEstados,
          );
        const createdAtByJobId =
          new Map(
            trabajos.map(
              (trabajo) => [
                trabajo.id,
                trabajo.creadoEn,
              ],
            ),
          );
        const valorEstimadoFinalizado =
          finalizados.reduce(
            (total, trabajo) =>
              total +
              serializeMoney(
                trabajo.montoEstimado,
              ),
            0,
          );

        return {
          id: service.id,
          nombre:
            service.nombre,
          trabajosCreados:
            trabajos.length,
          trabajosActivos:
            trabajos.filter(
              (trabajo) =>
                ACTIVE_JOB_STATES.includes(
                  trabajo.estado,
                ),
            ).length,
          trabajosFinalizados:
            finalizados.length,
          trabajosCancelados:
            trabajos.filter(
              (trabajo) =>
                trabajo.estado ===
                TrabajoEstado.CANCELADO,
            ).length,
          driversAsignados:
            service
              .driverServicios
              .length,
          valorEstimadoFinalizado:
            Number(
              valorEstimadoFinalizado.toFixed(
                2,
              ),
            ),
          tiempoPromedioResolucionMinutos:
            calculateAverageCompletionMinutes(
              histories,
              createdAtByJobId,
            ),
        };
      },
    );

  return NextResponse.json({
    status: "success",
    data: {
      app: "driver",
      checkedAt:
        new Date().toISOString(),
      range: {
        from: range.fromKey,
        to: range.toKey,
      },
      serviceTypes: data,
    },
  });
}
