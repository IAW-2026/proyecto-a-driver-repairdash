import {
  DriverStatus,
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
  ACCEPTED_JOB_STATES,
  ACTIVE_JOB_STATES,
  calculateAverageCompletionMinutes,
  calculateRate,
} from "@/lib/analytics/metrics";
import {
  serializeMoney,
  serializeRate,
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

  const [
    trabajos,
    histories,
    rechazos,
    activeJobsCurrent,
    totalDrivers,
    onlineDrivers,
    onboardedDrivers,
  ] = await Promise.all([
    prisma.trabajo.findMany({
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
      },
    }),
    prisma.historialEstado.findMany({
      where: {
        creadoEn: {
          gte: range.from,
          lte: range.to,
        },
        estadoNuevo: {
          in: [
            TrabajoEstado.ACEPTADO,
            TrabajoEstado.FINALIZADO,
            TrabajoEstado.CANCELADO,
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
    }),
    prisma.trabajoRechazado.count({
      where: {
        creadoEn: {
          gte: range.from,
          lte: range.to,
        },
      },
    }),
    prisma.trabajo.count({
      where: {
        estado: {
          in: [
            ...ACTIVE_JOB_STATES,
          ],
        },
      },
    }),
    prisma.driver.count(),
    prisma.driver.count({
      where: {
        status:
          DriverStatus.ONLINE,
      },
    }),
    prisma.driver.count({
      where: {
        onboardingCompleto:
          true,
      },
    }),
  ]);

  const createdAtByJobId =
    new Map(
      trabajos.map(
        (trabajo) => [
          trabajo.id,
          trabajo.creadoEn,
        ],
      ),
    );

  const trabajosCreados =
    trabajos.length;

  const trabajosAceptados =
    trabajos.filter(
      (trabajo) =>
        ACCEPTED_JOB_STATES.includes(
          trabajo.estado,
        ),
    ).length;

  const trabajosFinalizados =
    trabajos.filter(
      (trabajo) =>
        trabajo.estado ===
        TrabajoEstado.FINALIZADO,
    );

  const trabajosCancelados =
    trabajos.filter(
      (trabajo) =>
        trabajo.estado ===
        TrabajoEstado.CANCELADO,
    ).length;

  const valorEstimadoFinalizado =
    trabajosFinalizados.reduce(
      (total, trabajo) =>
        total +
        serializeMoney(
          trabajo.montoEstimado,
        ),
      0,
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
      jobs: {
        creados:
          trabajosCreados,
        activosActuales:
          activeJobsCurrent,
        finalizados:
          trabajosFinalizados.length,
        cancelados:
          trabajosCancelados,
        rechazados:
          rechazos,
        tasaAceptacion:
          serializeRate(
            calculateRate(
              trabajosAceptados,
              trabajosCreados,
            ),
          ),
        tasaFinalizacion:
          serializeRate(
            calculateRate(
              trabajosFinalizados.length,
              trabajosCreados,
            ),
          ),
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
      },
      drivers: {
        total:
          totalDrivers,
        onlineActuales:
          onlineDrivers,
        onboardingCompleto:
          onboardedDrivers,
      },
    },
  });
}
