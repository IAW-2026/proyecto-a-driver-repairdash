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
  buildDailyBuckets,
  getAnalyticsDateRange,
  getDayKey,
} from "@/lib/analytics/date-range";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

type Bucket = {
  date: string;
  creados: number;
  aceptados: number;
  finalizados: number;
  cancelados: number;
  rechazados: number;
};

function increment(
  buckets: Map<string, Bucket>,
  date: Date,
  key: keyof Omit<
    Bucket,
    "date"
  >,
) {
  const bucket =
    buckets.get(
      getDayKey(date),
    );

  if (!bucket) {
    return;
  }

  bucket[key] += 1;
}

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

  const bucketParam =
    req.nextUrl.searchParams.get(
      "bucket",
    ) ?? "day";

  if (
    bucketParam !== "day"
  ) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Bucket no soportado. Usar bucket=day.",
      },
      {
        status: 400,
      },
    );
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

  const buckets =
    new Map(
      buildDailyBuckets(
        range,
      ).map((date) => [
        date,
        {
          date,
          creados: 0,
          aceptados: 0,
          finalizados: 0,
          cancelados: 0,
          rechazados: 0,
        },
      ]),
    );

  const [
    trabajos,
    histories,
    rechazos,
  ] = await Promise.all([
    prisma.trabajo.findMany({
      where: {
        creadoEn: {
          gte: range.from,
          lte: range.to,
        },
      },
      select: {
        creadoEn: true,
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
        estadoNuevo: true,
        creadoEn: true,
      },
    }),
    prisma.trabajoRechazado.findMany({
      where: {
        creadoEn: {
          gte: range.from,
          lte: range.to,
        },
      },
      select: {
        creadoEn: true,
      },
    }),
  ]);

  for (const trabajo of trabajos) {
    increment(
      buckets,
      trabajo.creadoEn,
      "creados",
    );
  }

  for (const history of histories) {
    if (
      history.estadoNuevo ===
      TrabajoEstado.ACEPTADO
    ) {
      increment(
        buckets,
        history.creadoEn,
        "aceptados",
      );
    }

    if (
      history.estadoNuevo ===
      TrabajoEstado.FINALIZADO
    ) {
      increment(
        buckets,
        history.creadoEn,
        "finalizados",
      );
    }

    if (
      history.estadoNuevo ===
      TrabajoEstado.CANCELADO
    ) {
      increment(
        buckets,
        history.creadoEn,
        "cancelados",
      );
    }
  }

  for (const rechazo of rechazos) {
    increment(
      buckets,
      rechazo.creadoEn,
      "rechazados",
    );
  }

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
      bucket: "day",
      series: Array.from(
        buckets.values(),
      ),
    },
  });
}
