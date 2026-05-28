import { TrabajoEstado } from "@prisma/client";

export const TRANSITIONS: Record<TrabajoEstado, TrabajoEstado[]> = {
  PENDIENTE: ["ACEPTADO", "RECHAZADO"],
  ACEPTADO: ["EN_CAMINO"],
  EN_CAMINO: ["EN_SERVICIO"],
  EN_SERVICIO: ["FINALIZADO"],
  FINALIZADO: [],
  RECHAZADO: [],
  CANCELADO: [],
};

export function canTransition(from: TrabajoEstado, to: TrabajoEstado): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextState(current: TrabajoEstado): TrabajoEstado | null {
  const next = TRANSITIONS[current];
  return next && next.length > 0 ? next[0] : null;
}
