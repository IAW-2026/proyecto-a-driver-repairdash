import {
  TrabajoEstado,
} from "@prisma/client";

export const ACTIVE_JOB_STATES: TrabajoEstado[] =
  [
    TrabajoEstado.PENDIENTE,
    TrabajoEstado.ACEPTADO,
    TrabajoEstado.EN_CAMINO,
    TrabajoEstado.EN_SERVICIO,
  ];

export const ACCEPTED_JOB_STATES: TrabajoEstado[] =
  [
    TrabajoEstado.ACEPTADO,
    TrabajoEstado.EN_CAMINO,
    TrabajoEstado.EN_SERVICIO,
    TrabajoEstado.FINALIZADO,
  ];

type HistoryPoint = {
  trabajoId: string;
  estadoNuevo: TrabajoEstado;
  creadoEn: Date;
};

export function calculateRate(
  numerator: number,
  denominator: number,
) {
  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

export function calculateAverageCompletionMinutes(
  histories: HistoryPoint[],
  createdAtByJobId: Map<
    string,
    Date
  >,
) {
  const acceptedAt =
    new Map<string, Date>();
  const completedAt =
    new Map<string, Date>();

  for (const history of histories) {
    if (
      history.estadoNuevo ===
        TrabajoEstado.ACEPTADO &&
      !acceptedAt.has(
        history.trabajoId,
      )
    ) {
      acceptedAt.set(
        history.trabajoId,
        history.creadoEn,
      );
    }

    if (
      history.estadoNuevo ===
        TrabajoEstado.FINALIZADO &&
      !completedAt.has(
        history.trabajoId,
      )
    ) {
      completedAt.set(
        history.trabajoId,
        history.creadoEn,
      );
    }
  }

  const durations: number[] =
    [];

  for (const [
    trabajoId,
    finishedAt,
  ] of completedAt) {
    const startedAt =
      acceptedAt.get(
        trabajoId,
      ) ??
      createdAtByJobId.get(
        trabajoId,
      );

    if (!startedAt) {
      continue;
    }

    const durationMs =
      finishedAt.getTime() -
      startedAt.getTime();

    if (durationMs > 0) {
      durations.push(
        durationMs /
          1000 /
          60,
      );
    }
  }

  if (
    durations.length === 0
  ) {
    return null;
  }

  const total =
    durations.reduce(
      (sum, duration) =>
        sum + duration,
      0,
    );

  return Number(
    (
      total /
      durations.length
    ).toFixed(1),
  );
}
