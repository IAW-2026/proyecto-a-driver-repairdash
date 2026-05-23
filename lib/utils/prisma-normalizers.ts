// lib/utils/prisma-normalizers.ts
import type { Trabajo, TipoServicio } from "@prisma/client";

export type TrabajoDto = Omit<Trabajo, "montoEstimado"> & {
  montoEstimado: number;
  tipoServicio: TipoServicioDto;
};

export type TipoServicioDto = Omit<TipoServicio, "precioBase"> & {
  precioBase: number;
};

export function normalizeTipoServicio(tipo: TipoServicio): TipoServicioDto {
  return {
    ...tipo,
    precioBase: Number(tipo.precioBase),
  };
}

export function normalizeTrabajo(trabajo: Trabajo & { tipoServicio: TipoServicio }): TrabajoDto {
  return {
    ...trabajo,
    montoEstimado: Number(trabajo.montoEstimado),
    tipoServicio: normalizeTipoServicio(trabajo.tipoServicio),
  };
}
